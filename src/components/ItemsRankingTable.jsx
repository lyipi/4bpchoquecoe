import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ItemsRankingTable = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('rso')
        .select('*')
        .eq('status', 'approved');

      if (error) throw error;

      const userStats = {};

      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, username');

      const usersCache = {};
      users?.forEach(u => {
        usersCache[u.id] = u.full_name || u.username;
      });

      data?.forEach(record => {
        const bombs = Number(record.bombs) || 0;
        const lockpicks = Number(record.lockpicks) || 0;
        const detained = Number(record.detained) || 0;

        // ---------- MUNIÇÃO (CORRIGIDO) ----------
        let ammo = 0;
        if (record.ammunition != null) ammo = Number(record.ammunition) || 0;
        else if (record.ammo != null) ammo = Number(record.ammo) || 0;
        else if (record.municao != null) ammo = Number(record.municao) || 0;

        // ---------- ARMAS ----------
        let weapons = 0;
        if (Array.isArray(record.weapons)) {
          weapons = record.weapons.length;
        } else if (
          typeof record.weapons === 'string' &&
          record.weapons.trim().startsWith('[')
        ) {
          try {
            weapons = JSON.parse(record.weapons).length;
          } catch {}
        } else if (Number(record.weapons)) {
          weapons = Number(record.weapons);
        }

        // ---------- DROGAS (CORRIGIDO) ----------
        let drugs = 0;

        if (typeof record.drugs === 'number') {
          drugs = record.drugs;
        } else if (typeof record.drugs === 'string') {
          drugs = Number(record.drugs) || 0;
        } else if (Array.isArray(record.drugs)) {
          drugs = record.drugs.reduce(
            (sum, d) => sum + (Number(d.quantity) || Number(d.qtd) || 0),
            0
          );
        } else if (typeof record.drugs === 'object' && record.drugs !== null) {
          drugs = Object.values(record.drugs).reduce(
            (sum, val) => sum + (Number(val) || 0),
            0
          );
        }

        // ---------- DINHEIRO ----------
        let money = 0;
        if (typeof record.marked_money === 'number') {
          money = record.marked_money;
        } else if (typeof record.marked_money === 'string') {
          const clean = record.marked_money
            .replace(/[^\d,.-]/g, '')
            .replace('.', '')
            .replace(',', '.');
          money = Number(clean) || 0;
        }

        const totalItems =
          bombs +
          lockpicks +
          detained +
          weapons +
          drugs +
          ammo;

        // ---------- MEMBROS ----------
        let members = [];
        if (Array.isArray(record.members)) {
          members = record.members;
        } else if (typeof record.members === 'object' && record.members !== null) {
          members = Object.values(record.members);
        }

        members.forEach(member => {
          const id = member.id || member.user_id;
          if (!id) return;

          if (!userStats[id]) {
            userStats[id] = {
              user_id: id,
              name: member.name || usersCache[id] || 'Desconhecido',
              total_items: 0,
              item_breakdown: {
                bombs: 0,
                lockpicks: 0,
                detained: 0,
                weapons: 0,
                drugs: 0,
                money: 0,
                ammo: 0
              }
            };
          }

          userStats[id].total_items += totalItems;
          userStats[id].item_breakdown.bombs += bombs;
          userStats[id].item_breakdown.lockpicks += lockpicks;
          userStats[id].item_breakdown.detained += detained;
          userStats[id].item_breakdown.weapons += weapons;
          userStats[id].item_breakdown.drugs += drugs;
          userStats[id].item_breakdown.money += money;
          userStats[id].item_breakdown.ammo += ammo;
        });
      });

      const sorted = Object.values(userStats)
        .sort((a, b) => b.total_items - a.total_items)
        .slice(0, 100);

      setRanking(sorted);
    } catch (err) {
      console.error('Erro no ranking de apreensões:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('items-ranking-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rso' },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500 animate-pulse">
        Carregando ranking...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="w-full text-left overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[80px_200px_repeat(7,1fr)_100px] gap-2 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-slate-900/80 sticky top-0 backdrop-blur-sm z-10">
            <div className="text-center">Pos</div>
            <div>Nome</div>
            <div className="text-center">Drogas</div>
            <div className="text-center">Armas</div>
            <div className="text-center text-green-500">Munição</div>
            <div className="text-center">Dinheiro</div>
            <div className="text-center">Bombas</div>
            <div className="text-center">Lockpick</div>
            <div className="text-right">TOTAL</div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {ranking.map((user, index) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'grid grid-cols-[80px_200px_repeat(7,1fr)_100px] gap-2 p-4 items-center hover:bg-slate-800/30 transition-colors text-sm',
                  index < 3 ? 'bg-gradient-to-r from-green-500/5 to-transparent' : ''
                )}
              >
                <div className="flex justify-center items-center font-bold text-lg">
                  {getRankIcon(index)}
                </div>

                <div
                  className={cn(
                    'font-medium truncate pr-2',
                    index === 0 ? 'text-green-400 font-bold' : 'text-slate-300'
                  )}
                >
                  {user.name}
                </div>

                <div className="text-center text-slate-400">
                  {Math.floor(user.item_breakdown.drugs)}
                </div>
                <div className="text-center text-slate-400">
                  {user.item_breakdown.weapons}
                </div>
                <div className="text-center text-green-400 font-medium">
                  {user.item_breakdown.ammo}
                </div>
                <div className="text-center text-slate-400 text-xs truncate">
                  {user.item_breakdown.money > 0
                    ? `R$ ${(user.item_breakdown.money / 1000).toFixed(1)}k`
                    : '-'}
                </div>
                <div className="text-center text-slate-400">
                  {user.item_breakdown.bombs}
                </div>
                <div className="text-center text-slate-400">
                  {user.item_breakdown.lockpicks}
                </div>
                <div className="text-right font-mono text-green-400 font-bold tabular-nums pr-2">
                  {user.total_items}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsRankingTable;