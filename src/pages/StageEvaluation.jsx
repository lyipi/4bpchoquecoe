import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import VehiclePrefixSelect from '@/components/VehiclePrefixSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CRITERIA = ['Postura', 'Disciplina', 'Atenção', 'Iniciativa', 'Trabalho em Equipe', 'Conhecimento Técnico', 'Cumprimento de Ordens'];

const StageEvaluation = () => {
  const { currentUser, hasRole } = useAuth();
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [formData, setFormData] = useState({
    vehiclePrefix: '', 
    traineeName: '',
    scores: CRITERIA.reduce((acc, curr) => ({ ...acc, [curr]: 5 }), {}),
    comments: ''
  });

  useEffect(() => {
    fetchEvaluations();
    fetchUsers();
  }, [currentUser]);

  const fetchEvaluations = async () => {
    if(!currentUser) return;
    let query = supabase.from('stage_evaluation').select('*').order('created_at', { ascending: false });
    if (!hasRole(['Administrativos', 'Super Administrativo'])) {
        query = query.eq('user_id', currentUser.id);
    }
    const { data } = await query;
    setEvaluations(data || []);
  };

  const fetchUsers = async () => {
    // Fetch ALL users from public.users table, no filters
    const { data, error } = await supabase
      .from('users')
      .select('full_name, username')
      .order('full_name');
      
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsersList(data || []);
    }
  };

  const calculateAverage = (scores) => {
    const total = Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0);
    return (total / CRITERIA.length).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.traineeName || !formData.vehiclePrefix) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const avg = calculateAverage(formData.scores);

    const newEvaluation = {
      user_id: currentUser.id,
      vehicle_prefix: formData.vehiclePrefix,
      trainee_name: formData.traineeName,
      scores: formData.scores,
      final_grade: avg,
      comments: formData.comments,
      evaluator_name: currentUser.name || currentUser.username,
      evaluator_role: currentUser.role,
      status: 'pending'
    };

    const { error } = await supabase.from('stage_evaluation').insert(newEvaluation);

    if (error) {
       toast({ title: 'Erro', description: error.message });
    } else {
       toast({ title: 'Avaliação Registrada', description: `Média Final: ${avg}` });
       setFormData({
         vehiclePrefix: '',
         traineeName: '',
         scores: CRITERIA.reduce((acc, curr) => ({ ...acc, [curr]: 5 }), {}),
         comments: ''
       });
       fetchEvaluations();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-[#5FD068]" />
        <div>
          <h1 className="text-3xl font-bold text-white">Avaliação de Estágio</h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#1a1a1a] to-black border border-[#5FD068]/20 rounded-xl p-6 md:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-[#a8a9ad] mb-2">Viatura da Instrução</label>
                <VehiclePrefixSelect value={formData.vehiclePrefix} onChange={e => setFormData({ ...formData, vehiclePrefix: e.target.value })} />
             </div>
             <div>
                <label className="block text-sm font-medium text-[#a8a9ad] mb-2">Estagiário / Soldado</label>
                <Select onValueChange={(val) => setFormData({ ...formData, traineeName: val })}>
                  <SelectTrigger className="bg-black border-[#a8a9ad]/30 text-white h-[48px]">
                    <SelectValue placeholder="Selecione o militar..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-slate-700 text-white max-h-[300px]">
                    {usersList.map((user, idx) => (
                      <SelectItem key={idx} value={user.full_name || user.username}>
                        {user.full_name || user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {CRITERIA.map(criterion => (
              <div key={criterion} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm text-[#a8a9ad] font-medium">{criterion}</label>
                  <span className="text-sm font-bold text-[#5FD068]">{formData.scores[criterion]}</span>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={formData.scores[criterion]} onChange={e => setFormData(p => ({...p, scores: {...p.scores, [criterion]: e.target.value}}))} className="w-full h-2 bg-[#333] rounded-lg accent-[#5FD068]" />
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-end">
             <div className="text-right">
                <span className="text-sm text-[#a8a9ad] block">Média Parcial</span>
                <span className="text-3xl font-bold text-[#5FD068]">{calculateAverage(formData.scores)}</span>
             </div>
          </div>

          <div className="w-full">
             <label className="block text-sm font-medium text-[#a8a9ad] mb-2">Observações</label>
             <textarea value={formData.comments} onChange={e => setFormData({ ...formData, comments: e.target.value })} className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white h-20" />
          </div>

          <Button type="submit" className="w-full bg-[#5FD068] text-black font-bold py-6">Registrar Avaliação</Button>
        </form>
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white pl-2 border-l-4 border-[#5FD068]">
          {hasRole(['Administrativos', 'Super Administrativo']) ? 'Todas as Avaliações' : 'Minhas Avaliações Realizadas'}
        </h2>
        <div className="grid gap-4">
            {evaluations.map(ev => (
              <div key={ev.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#a8a9ad]/10 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold text-lg">{ev.trainee_name}</h3>
                  <p className="text-xs text-[#a8a9ad]">Vtr: {ev.vehicle_prefix} • Avaliador: {ev.evaluator_name}</p>
                  <p className="text-xs text-[#a8a9ad] mt-1 italic">"{ev.comments}"</p>
                </div>
                <div className="text-right flex flex-col items-center min-w-[60px]">
                  <span className="text-xs text-[#a8a9ad] mb-1">Média</span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold text-lg
                      ${Number(ev.final_grade) >= 7 ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}
                  `}>
                      {ev.final_grade}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default StageEvaluation;