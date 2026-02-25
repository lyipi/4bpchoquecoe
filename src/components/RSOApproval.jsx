import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

const RSOApproval = () => {
  const { toast } = useToast();
  const [rsoList, setRsoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRSO();
  }, []);

  const fetchRSO = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rso')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar RSOs', variant: 'destructive' });
    } else {
      setRsoList(data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (rso, newStatus) => {
    const { error } = await supabase
      .from('rso')
      .update({ status: newStatus })
      .eq('id', rso.id);

    if (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar status', variant: 'destructive' });
    } else {
      toast({ 
        title: 'Sucesso', 
        description: `RSO ${newStatus === 'approved' ? 'Aprovado' : 'Rejeitado'} com sucesso.` 
      });
      fetchRSO();
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="text-white">Carregando RSOs...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Gestão de RSOs</h3>
      <div className="grid gap-4">
        {rsoList.length === 0 && <p className="text-[#a8a9ad]">Nenhum RSO encontrado.</p>}
        {rsoList.map((rso) => (
          <motion.div 
            key={rso.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/40 border border-[#a8a9ad]/20 rounded-lg overflow-hidden"
          >
            <div className="p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                    rso.status === 'approved' ? 'bg-green-900 text-green-200' :
                    rso.status === 'rejected' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {rso.status === 'pending' ? 'Pendente' : rso.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </span>
                  <span className="text-[#5FD068] font-bold">{rso.unit_prefix}</span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(rso.created_at).toLocaleString()}</span>
                </div>
                <p className="text-white text-sm"><span className="text-[#a8a9ad]">Autor:</span> {rso.author}</p>
                <div className="flex items-center gap-2 mt-2">
                   <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-400 p-0 hover:text-blue-300 hover:bg-transparent" onClick={() => toggleExpand(rso.id)}>
                      {expandedId === rso.id ? 'Ver Menos' : 'Ver Detalhes'} {expandedId === rso.id ? <ChevronUp className="w-3 h-3 ml-1"/> : <ChevronDown className="w-3 h-3 ml-1"/>}
                   </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {rso.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(rso, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleStatusUpdate(rso, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                    </Button>
                  </>
                )}
                {rso.status !== 'pending' && (
                   <Button 
                   size="sm" 
                   variant="outline"
                   onClick={() => handleStatusUpdate(rso, 'pending')}
                 >
                   Reabrir
                 </Button>
                )}
              </div>
            </div>

            {expandedId === rso.id && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-slate-900/50 border-t border-slate-800 p-4 text-sm text-slate-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <Card className="bg-black/40 border-slate-700">
                      <CardContent className="p-3 space-y-2">
                        <p className="font-bold text-white mb-2">Resumo da Apreensão</p>
                        <div className="grid grid-cols-2 gap-y-1">
                          <span>Ocorrências:</span> <span className="text-white font-mono">{rso.occurrences}</span>
                          <span>Drogas:</span> <span className="text-white font-mono">{rso.drugs}</span>
                          <span>Armas:</span> <span className="text-white font-mono">{rso.weapons}</span>
                          <span>Dinheiro:</span> <span className="text-white font-mono">{rso.marked_money}</span>
                          <span>Bombas:</span> <span className="text-white font-mono">{rso.bombs}</span>
                          <span>Lockpicks:</span> <span className="text-white font-mono">{rso.lockpicks}</span>
                          <span>Detidos:</span> <span className="text-white font-mono">{rso.detained}</span>
                          <span>Munição:</span> <span className="text-white font-mono">{rso.ammo || 0}</span>
                        </div>
                      </CardContent>
                   </Card>
                   
                   <div className="space-y-4">
                      <div>
                        <p className="font-bold text-white mb-1">Membros Envolvidos</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(rso.members) ? rso.members.map((m, idx) => (
                            <span key={idx} className="bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700">
                              {m.name || m.user_id}
                            </span>
                          )) : <span className="italic text-slate-500">Sem dados de membros</span>}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white mb-1">Ações Realizadas</p>
                        <p className="bg-black/30 p-2 rounded border border-slate-800 text-xs italic">
                           {rso.actions || "Nenhuma descrição fornecida."}
                        </p>
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RSOApproval;