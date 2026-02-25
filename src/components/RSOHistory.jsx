import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Calendar, FileText } from 'lucide-react';

const RSOHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ prefix: '', startDate: '', endDate: '' });

  useEffect(() => {
    fetchReports();
    const channel = supabase.channel('rso-history').on('postgres_changes', { event: '*', schema: 'public', table: 'rso' }, fetchReports).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase.from('rso').select('*').order('created_at', { ascending: false });

    if (filters.prefix) query = query.ilike('unit_prefix', `%${filters.prefix}%`);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;
    if (!error) setReports(data || []);
    setLoading(false);
  };

  // Helper to safely display item counts
  const getItemCount = (item) => {
      if (typeof item === 'number') return item;
      if (Array.isArray(item)) return item.length; // usually weapons array
      return 0;
  };

  const getMoney = (money) => {
       if (typeof money === 'string') return money;
       if (typeof money === 'number') return `R$ ${money}`;
       return '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 bg-black/40 p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 flex-1 bg-black/20 p-2 rounded border border-white/5">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            placeholder="Buscar por prefixo..." 
            value={filters.prefix}
            onChange={(e) => setFilters(prev => ({ ...prev, prefix: e.target.value }))}
            className="bg-transparent border-none text-white focus:outline-none w-full text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-black/20 p-2 rounded border border-white/5">
           <Calendar className="w-4 h-4 text-gray-400" />
           <input type="date" className="bg-transparent text-white text-xs border-none focus:outline-none" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
           <span className="text-gray-400 text-xs">até</span>
           <input type="date" className="bg-transparent text-white text-xs border-none focus:outline-none" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
        </div>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden bg-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/60 border-b border-white/10 text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Prefixo</th>
                <th className="p-4">Autor</th>
                <th className="p-4 text-center">Armas</th>
                <th className="p-4 text-center">Drogas</th>
                <th className="p-4 text-center">Detidos</th>
                <th className="p-4 text-right">Dinheiro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Carregando...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Nenhum RSO encontrado.</td></tr>
              ) : (
                reports.map((rso) => (
                  <tr key={rso.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-300">{new Date(rso.created_at).toLocaleString()}</td>
                    <td className="p-4 font-bold text-[#5FD068]">{rso.unit_prefix}</td>
                    <td className="p-4 text-gray-400">{rso.author}</td>
                    <td className="p-4 text-center">{getItemCount(rso.weapons)}</td>
                    <td className="p-4 text-center">{typeof rso.drugs === 'number' ? rso.drugs : '-'}</td>
                    <td className="p-4 text-center">{rso.detained}</td>
                    <td className="p-4 text-right font-mono text-xs">{getMoney(rso.marked_money)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RSOHistory;