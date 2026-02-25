import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export async function calculateUserHours() {
  try {
    const { data, error } = await supabase
      .from('bate_ponto')
      .select('user_id, duration_seconds, users(full_name, username)')
      .not('duration_seconds', 'is', null);

    if (error) {
      console.error('Error calculating hours:', error);
      return [];
    }

    const userTotals = {};

    data?.forEach(record => {
      if (!record.user_id) return;
      
      if (!userTotals[record.user_id]) {
        userTotals[record.user_id] = {
          user_id: record.user_id,
          name: record.users?.full_name || record.users?.username || 'Desconhecido',
          total_seconds: 0,
          total_records: 0
        };
      }
      
      userTotals[record.user_id].total_seconds += (Number(record.duration_seconds) || 0);
      userTotals[record.user_id].total_records += 1;
    });

    return Object.values(userTotals).map(u => ({
      ...u,
      total_hours: (u.total_seconds / 3600).toFixed(2)
    }));
  } catch (err) {
    console.error("Unexpected error in calculateUserHours", err);
    return [];
  }
}

export async function calculateUserItems() {
  try {
    const { data, error } = await supabase
      .from('rso')
      .select('*');

    if (error) {
      console.error('Error calculating items:', error);
      return [];
    }

    const userStats = {};
    const usersCache = {};
    
    // Cache user names
    const { data: users } = await supabase.from('users').select('id, full_name, username');
    users?.forEach(u => usersCache[u.id] = u.full_name || u.username);

    data?.forEach(record => {
      // Parse Items
      const bombs = Number(record.bombs) || 0;
      const lockpicks = Number(record.lockpicks) || 0;
      const detained = Number(record.detained) || 0;
      
      // Weapons logic
      let weapons = 0;
      if (Array.isArray(record.weapons)) {
        weapons = record.weapons.length;
      } else if (typeof record.weapons === 'string' && record.weapons.trim().startsWith('[')) {
          try { weapons = JSON.parse(record.weapons).length; } catch (e) { console.warn("Failed parsing weapons json", e); }
      } else if (Number(record.weapons)) {
        weapons = Number(record.weapons);
      }

      // Drugs logic
      let drugs = 0;
      if (typeof record.drugs === 'number') {
        drugs = record.drugs;
      } else if (Array.isArray(record.drugs)) {
        drugs = record.drugs.reduce((a, b) => a + (Number(b.quantity)||0), 0);
      } else if (typeof record.drugs === 'string' && record.drugs.trim().startsWith('[')) {
          try { drugs = JSON.parse(record.drugs).reduce((a, b) => a + (Number(b.quantity)||0), 0); } catch (e) { console.warn("Failed parsing drugs json", e); }
      }

      // Money logic
      let money = 0;
      if (typeof record.marked_money === 'number') {
        money = record.marked_money;
      } else if (typeof record.marked_money === 'string') {
          const clean = record.marked_money.replace(/[^\d,.-]/g, '').replace('.','').replace(',','.');
          money = Number(clean) || 0;
      }

      const totalItems = bombs + lockpicks + detained + weapons + drugs;

      // Parse Members
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
                  item_breakdown: { bombs: 0, lockpicks: 0, detained: 0, weapons: 0, drugs: 0, money: 0 }
              };
          }
          
          userStats[id].total_items += totalItems;
          userStats[id].item_breakdown.bombs += bombs;
          userStats[id].item_breakdown.lockpicks += lockpicks;
          userStats[id].item_breakdown.detained += detained;
          userStats[id].item_breakdown.weapons += weapons;
          userStats[id].item_breakdown.drugs += drugs;
          userStats[id].item_breakdown.money += money;
      });
    });

    return Object.values(userStats);
  } catch (err) {
    console.error("Unexpected error in calculateUserItems", err);
    return [];
  }
}