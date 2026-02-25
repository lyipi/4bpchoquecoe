import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Activity, Clock, Users, FileBarChart, Loader2, Target } from 'lucide-react';
import StatCard from './StatCard';
import ItemBreakdownCard from './ItemBreakdownCard';
import { calculateUserHours, calculateUserItems } from '@/lib/utils';

const RealtimeDashboardStats = () => {
  const [stats, setStats] = useState({
    totalHours: 0,
    totalActiveMembers: 0,
    rsoTotal: 0,
    rsoItems: {
      drugs: 0, weapons: 0, ammo: 0, bombs: 0, lockpicks: 0, money: 0, detained: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    try {
      const userHours = await calculateUserHours();
      const totalHours = userHours.reduce((sum, u) => sum + u.total_seconds, 0) / 3600;
      const totalActiveMembers = userHours.length;

      // Filter: only approved RSOs
      const { data: rsoData } = await supabase
        .from('rso')
        .select('*')
        .eq('status', 'approved');

      const rsoGlobalStats = (rsoData || []).reduce((acc, record) => {
         const bombs = Number(record.bombs) || 0;
         const lockpicks = Number(record.lockpicks) || 0;
         const detained = Number(record.detained) || 0;
         
         // Ammo calculation
         let ammo = 0;
         if (record.ammunition != null) ammo = Number(record.ammunition) || 0;
         else if (record.ammo != null) ammo = Number(record.ammo) || 0;
         else if (record.municao != null) ammo = Number(record.municao) || 0;

         let weapons = 0;
         if (Array.isArray(record.weapons)) {
           weapons = record.weapons.length;
         } else if (typeof record.weapons === 'string' && record.weapons.startsWith('[')) {
           try { weapons = JSON.parse(record.weapons).length; } catch {}
         } else if (Number(record.weapons)) {
           weapons = Number(record.weapons);
         }

         let drugs = 0;
         if (typeof record.drugs === 'number') drugs = record.drugs;
         else if (typeof record.drugs === 'string') drugs = Number(record.drugs) || 0;
         
         let money = 0;
         if (typeof record.marked_money === 'number') {
           money = record.marked_money;
         } else if (typeof record.marked_money === 'string') {
            const clean = record.marked_money.replace(/[^\d,.-]/g, '').replace('.','').replace(',','.');
            money = Number(clean) || 0;
         }

         return {
            bombs: acc.bombs + bombs,
            lockpicks: acc.lockpicks + lockpicks,
            detained: acc.detained + detained,
            weapons: acc.weapons + weapons,
            drugs: acc.drugs + drugs,
            money: acc.money + money,
            ammo: acc.ammo + ammo
         };
      }, { bombs: 0, lockpicks: 0, detained: 0, weapons: 0, drugs: 0, money: 0, ammo: 0 });

      setStats({
        totalHours: totalHours.toFixed(1),
        totalActiveMembers,
        rsoTotal: rsoData?.length || 0,
        rsoItems: rsoGlobalStats
      });

    } catch (error) {
      console.error('Error stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const c1 = supabase.channel('dash-1').on('postgres_changes', { event: '*', schema: 'public', table: 'bate_ponto' }, refreshStats).subscribe();
    const c2 = supabase.channel('dash-2').on('postgres_changes', { event: '*', schema: 'public', table: 'rso' }, refreshStats).subscribe();
    return () => { supabase.removeChannel(c1); supabase.removeChannel(c2); };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-xl border border-green-500/20 animate-pulse">
        <Loader2 className="w-10 h-10 text-green-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Carregando dados em tempo real...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#4ade80]" />
        <h2 className="text-lg font-semibold text-white tracking-wide uppercase">Dashboard em Tempo Real</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Horas Totais" 
          value={stats.totalHours} 
          icon={Clock} 
          sublabel="Soma de horas trabalhadas"
        />
        <StatCard 
          label="Membros Ativos" 
          value={stats.totalActiveMembers} 
          icon={Users} 
          sublabel="Com registro de ponto"
        />
        <StatCard 
          label="RSO Aprovados" 
          value={stats.rsoTotal} 
          icon={FileBarChart} 
          sublabel="Relatórios Oficiais"
        />
        <StatCard 
          label="Apreensões (R$)" 
          value={stats.rsoItems.money} 
          icon={Activity} 
          sublabel="Valor em espécime"
          isCurrency={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <StatCard 
                    label="Armamento Apreendido" 
                    value={stats.rsoItems.weapons} 
                    sublabel="Unidades Totais"
                    className="h-full bg-slate-800/50"
                />
                 <StatCard 
                    label="Detidos" 
                    value={stats.rsoItems.detained} 
                    sublabel="Indivíduos processados"
                    className="h-full bg-slate-800/50"
                />
                 <StatCard 
                    label="Munição Apreendida" 
                    value={stats.rsoItems.ammo} 
                    sublabel="Unidades"
                    icon={Target}
                    className="h-full bg-slate-800/50"
                />
            </div>
        </div>
        <div className="lg:col-span-1">
          <ItemBreakdownCard stats={stats.rsoItems} />
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboardStats;