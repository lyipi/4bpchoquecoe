import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const HoursRankingTable = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch ALL users from users table (source of truth for the list)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, username');

      if (usersError) throw usersError;

      // 2. Fetch ALL approved shifts from bate_ponto
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('bate_ponto')
        .select('*')
        .eq('approval_status', 'approved')
        .not('duration_seconds', 'is', null);

      if (shiftsError) throw shiftsError;

      // 3. Initialize User Map with all users (starting with 0 seconds)
      const userMap = new Map();
      usersData.forEach(user => {
        userMap.set(user.id, {
          user_id: user.id,
          name: user.full_name || user.username || 'Sem Nome',
          total_seconds: 0
        });
      });

      // 4. Deduplicate shifts to prevent double counting (handling potential legacy duplicate records)
      // Key is composed of creator + start time + vehicle
      const uniqueShifts = new Map();
      if (shiftsData) {
        shiftsData.forEach(record => {
          const key = `${record.started_by}_${record.start_time}_${record.vehicle_prefix}`;
          if (!uniqueShifts.has(key)) {
            uniqueShifts.set(key, record);
          }
        });
      }

      // 5. Aggregate Hours for each user found in shifts
      uniqueShifts.forEach(shift => {
        const duration = Number(shift.duration_seconds) || 0;
        
        let members = [];
        if (shift.members) {
          if (Array.isArray(shift.members)) {
            members = shift.members;
          } else if (typeof shift.members === 'object') {
            members = Object.values(shift.members);
          }
        }

        // Add duration to each member in the shift
        members.forEach(member => {
          const memberId = member.id || member.user_id;
          
          if (memberId && userMap.has(memberId)) {
            // User exists in our base list, add hours
            const userData = userMap.get(memberId);
            userData.total_seconds += duration;
            userMap.set(memberId, userData);
          } 
          // Note: If memberId is not in userMap (e.g. deleted user), they are currently ignored
          // as we want to rank current valid users.
        });
      });

      // 6. Convert to Array, Format, and Sort
      const sortedRanking = Array.from(userMap.values())
        .map(u => ({
          ...u,
          total_hours: (u.total_seconds / 3600).toFixed(2)
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds); // Sort descending by total seconds

      setRanking(sortedRanking);

    } catch (error) {
      console.error('Error fetching global ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to changes in bate_ponto to update real-time
    const channel = supabase.channel('global-hours-ranking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bate_ponto' }, fetchData)
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#5FD068]" />
        <p>Calculando ranking global...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full flex flex-col shadow-xl">
       <div className="w-full text-left">
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-black/40 sticky top-0 backdrop-blur-sm z-10">
            <div className="col-span-2 text-center">Posição</div>
            <div className="col-span-6">Militar</div>
            <div className="col-span-4 text-right">Horas Totais</div>
          </div>
          <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {ranking.length === 0 ? (
               <div className="p-8 text-center text-slate-500 col-span-12">Nenhum registro encontrado.</div>
            ) : (
              ranking.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "grid grid-cols-12 gap-4 p-4 items-center transition-colors border-l-2 border-transparent",
                    index < 3 ? "bg-gradient-to-r from-[#5FD068]/10 to-transparent border-l-[#5FD068]" : "hover:bg-slate-800/50"
                  )}
                >
                  <div className="col-span-2 flex justify-center items-center font-bold text-lg">
                    {getRankIcon(index)}
                  </div>
                  <div className={cn("col-span-6 font-medium truncate", index === 0 ? "text-[#5FD068] font-bold" : "text-slate-300")}>
                    {user.name}
                  </div>
                  <div className={cn("col-span-4 text-right font-mono tabular-nums", Number(user.total_hours) > 0 ? "text-white" : "text-slate-600")}>
                    {user.total_hours}h
                  </div>
                </motion.div>
              ))
            )}
          </div>
       </div>
    </div>
  );
};

export default HoursRankingTable;