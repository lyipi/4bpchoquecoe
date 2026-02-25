import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Calendar, User, Clock, Shield } from 'lucide-react';
import RSOHistory from '@/components/RSOHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ShiftHistory = () => {
  const [shifts, setShifts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchShifts();
    fetchEvaluations();
    
    const channel = supabase
      .channel('history-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bate_ponto' }, fetchShifts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stage_evaluation' }, fetchEvaluations)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [filters]);

  const fetchShifts = async () => {
    // ... existing logic kept
    let query = supabase
      .from('bate_ponto')
      .select('*, users(full_name, username)')
      .order('created_at', { ascending: false });

    if (filters.user) query = query.ilike('started_by', `%${filters.user}%`);
    if (filters.startDate) query = query.gte('start_time', filters.startDate);
    if (filters.endDate) query = query.lte('start_time', filters.endDate);

    const { data } = await query;
    setShifts(data || []);
  };

  const fetchEvaluations = async () => {
    let query = supabase.from('stage_evaluation').select('*').order('created_at', { ascending: false });
    
    // Applying same filters loosely (searching trainee_name for user filter)
    if (filters.user) query = query.ilike('trainee_name', `%${filters.user}%`);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    const { data } = await query;
    setEvaluations(data || []);
  };

  const calculateDuration = (seconds) => {
    if (!seconds) return 'Em andamento';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 bg-black/40 p-4 rounded-lg border border-white/10 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-black/20 p-2 rounded border border-white/5">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                placeholder="Buscar (Nome/Autor)..." 
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                className="bg-transparent border-none text-white focus:outline-none w-full text-sm"
              />
            </div>
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5">
               <Calendar className="w-4 h-4 text-gray-400" />
               <input 
                 type="date" 
                 className="bg-transparent text-white text-xs border-none focus:outline-none"
                 value={filters.startDate}
                 onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
               />
               <span className="text-gray-400 text-xs">até</span>
               <input 
                 type="date" 
                 className="bg-transparent text-white text-xs border-none focus:outline-none"
                 value={filters.endDate}
                 onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
               />
            </div>
      </div>

      <Tabs defaultValue="shifts" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 w-full flex justify-start">
          <TabsTrigger value="shifts" className="flex-1 md:flex-none">Histórico de Ponto</TabsTrigger>
          <TabsTrigger value="rso" className="flex-1 md:flex-none">Histórico RSO</TabsTrigger>
          <TabsTrigger value="evaluations" className="flex-1 md:flex-none">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-6">
          <div className="rounded-md border border-white/10 overflow-hidden bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Membro</th>
                    <th className="p-4">Viatura</th>
                    <th className="p-4">Início</th>
                    <th className="p-4">Duração</th>
                    <th className="p-4">Iniciado Por</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shifts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum registro.</td></tr>
                  ) : (
                    shifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#5FD068]" />
                            <span className="font-medium text-white">{shift.users?.full_name || 'Desconhecido'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-[#5FD068] font-mono font-bold border border-[#5FD068]/30 px-2 py-1 rounded bg-[#5FD068]/10">
                            {shift.vehicle_prefix}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">{new Date(shift.start_time).toLocaleString()}</td>
                        <td className="p-4 font-mono">{shift.final_duration || calculateDuration(shift.duration_seconds)}</td>
                        <td className="p-4 text-gray-400 text-xs">{shift.started_by}</td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${shift.status === 'completed' ? 'bg-green-900/50 text-green-200' : 'bg-blue-900/50 text-blue-200'}`}>
                            {shift.status === 'completed' ? 'Finalizado' : 'Em Andamento'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rso">
          <RSOHistory />
        </TabsContent>

        <TabsContent value="evaluations">
           <div className="rounded-md border border-white/10 overflow-hidden bg-[#1a1a1a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Estagiário</th>
                    <th className="p-4">Viatura</th>
                    <th className="p-4">Nota Final</th>
                    <th className="p-4">Avaliador</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {evaluations.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhuma avaliação encontrada.</td></tr>
                  ) : (
                    evaluations.map((ev) => (
                      <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{ev.trainee_name}</td>
                        <td className="p-4 font-mono text-[#5FD068]">{ev.vehicle_prefix}</td>
                        <td className="p-4">
                           <span className={`font-bold ${Number(ev.final_grade) >= 7 ? 'text-green-500' : 'text-red-500'}`}>
                             {ev.final_grade}
                           </span>
                        </td>
                        <td className="p-4 text-gray-400">{ev.evaluator_name}</td>
                        <td className="p-4 text-gray-500 text-xs">{new Date(ev.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftHistory;