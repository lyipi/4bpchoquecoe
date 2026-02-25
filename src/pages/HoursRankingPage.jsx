import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Clock, Trophy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const HoursRankingPage = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateRanking();
  }, []);

  const calculateRanking = async () => {
    setLoading(true);
    
    // Fetch ALL approved records
    const { data, error } = await supabase
      .from('bate_ponto')
      .select('*')
      .eq('approval_status', 'approved')
      .not('duration_seconds', 'is', null);

    if (error) {
      console.error('Error fetching hours:', error);
      setLoading(false);
      return;
    }

    const userTotals = {};
    const uniqueShifts = new Map();

    // Deduplicate shifts
    data?.forEach(record => {
      const key = `${record.started_by}_${record.start_time}_${record.vehicle_prefix}`;
      if(!uniqueShifts.has(key)) uniqueShifts.set(key, record);
    });

    // Distribute hours
    uniqueShifts.forEach(record => {
      const duration = Number(record.duration_seconds) || 0;
      let members = [];
      
      if(record.members) {
         if(Array.isArray(record.members)) members = record.members;
         else if(typeof record.members === 'object') members = Object.values(record.members);
      }

      members.forEach(m => {
        const uid = m.id || m.user_id;
        if(!uid) return;
        
        if(!userTotals[uid]) {
           userTotals[uid] = {
             user_id: uid,
             name: m.name || m.full_name || 'Desconhecido',
             total_seconds: 0
           };
        }
        userTotals[uid].total_seconds += duration;
      });
    });

    const sorted = Object.values(userTotals)
      .map(u => ({
        ...u,
        total_hours: (u.total_seconds / 3600).toFixed(2)
      }))
      .sort((a, b) => b.total_seconds - a.total_seconds);

    setRanking(sorted);
    setLoading(false);
  };

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 space-y-6 pb-24">
       <div className="flex items-center gap-4 mb-6">
         <Button variant="ghost" className="text-slate-400 hover:text-white pl-0" onClick={() => window.location.href = '/'}>
           <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
         </Button>
         <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Ranking de Horas
         </h1>
       </div>

       {loading ? (
         <div className="text-center text-slate-500 py-12">Carregando ranking...</div>
       ) : (
         <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden max-w-4xl mx-auto">
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-black/50">
                <div className="col-span-2 text-center">Posição</div>
                <div className="col-span-8">Militar</div>
                <div className="col-span-2 text-right">Horas</div>
            </div>
            <div className="divide-y divide-slate-800/50">
                {ranking.map((user, index) => (
                <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                    "grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/30 transition-colors",
                    index < 3 ? "bg-gradient-to-r from-green-500/10 to-transparent" : ""
                    )}
                >
                    <div className="col-span-2 flex justify-center items-center font-bold text-xl">
                    {getRankIcon(index)}
                    </div>
                    <div className={cn("col-span-8 font-medium", index === 0 ? "text-green-400 font-bold" : "text-slate-300")}>
                    {user.name}
                    </div>
                    <div className="col-span-2 text-right font-mono text-white tabular-nums">
                    {user.total_hours}h
                    </div>
                </motion.div>
                ))}
            </div>
         </div>
       )}
    </div>
  );
};

export default HoursRankingPage;