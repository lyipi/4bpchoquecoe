import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const StatCard = ({ label, sublabel, value, isCurrency, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay }}
    className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-green-500/30 transition-all duration-300 group relative overflow-hidden"
  >
    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-500/30 group-hover:bg-green-500 transition-colors" />
    
    <div className="relative z-10">
      <span className={cn(
        "block text-4xl md:text-5xl font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 group-hover:text-green-500 transition-colors",
        isCurrency && "text-3xl md:text-4xl"
      )}>
        {isCurrency 
          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
          : new Intl.NumberFormat('pt-BR').format(value)
        }
      </span>
      
      <h3 className="text-white font-bold uppercase text-xs md:text-sm tracking-widest mb-1">
        {label}
      </h3>
      
      {sublabel && (
        <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
          {sublabel}
        </span>
      )}
    </div>
    
    <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
  </motion.div>
);

const StatisticsSection = () => {
  const [stats, setStats] = useState({
    drugs: 0,
    weapons: 0,
    ammo: 0,
    bombs: 0,
    lockpicks: 0,
    money: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parseMoney = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove all non-numeric chars except comma, dot, and minus
      // Brazilian format example: R$ 1.000,00
      let clean = value.replace(/[^\d,.-]/g, '');
      // Remove thousands separator (dots) and replace decimal separator (comma) with dot
      clean = clean.replace(/\./g, '').replace(',', '.');
      return parseFloat(clean) || 0;
    }
    return 0;
  };

  const parseDrugs = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    let parsedValue = value;
    if (typeof value === 'string') {
        // Try to parse if it looks like JSON
        if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                // If not JSON, maybe just a string number like "10.5" or "10,5"
                return parseFloat(value.replace(',', '.')) || 0;
            }
        } else {
             return parseFloat(value.replace(',', '.')) || 0;
        }
    }

    if (Array.isArray(parsedValue)) {
        return parsedValue.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    } else if (typeof parsedValue === 'object' && parsedValue !== null) {
        return Number(parsedValue.quantity) || 0;
    }
    
    return Number(parsedValue) || 0;
  };

  const parseWeapons = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    let parsedValue = value;
    if (typeof value === 'string') {
         if (value.trim().startsWith('[')) {
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {
                return 0;
            }
         } else {
             // If it's just a string number
             return Number(value) || 0;
         }
    }

    if (Array.isArray(parsedValue)) {
        return parsedValue.length;
    }
    
    return Number(parsedValue) || 0;
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: rsoData, error: rsoError } = await supabase
        .from('rso')
        .select('*')
        .eq('status', 'approved');

      if (rsoError) throw rsoError;

      const calculatedStats = (rsoData || []).reduce((acc, record) => {
        // 1. Drugs (Sum quantity)
        const drugs = parseDrugs(record.drugs);
        
        // 2. Weapons (Count items)
        const weapons = parseWeapons(record.weapons);
        
        // 3. Ammunition (Sum quantity)
        const ammo = Number(record.ammo) || 0;

        // 4. Bombs (Sum quantity)
        const bombs = Number(record.bombs) || 0;
        
        // 5. Lockpicks (Sum quantity)
        const lockpicks = Number(record.lockpicks) || 0;

        // 6. Money (Sum value)
        // Checks 'marked_money' or 'money' fields
        const money = parseMoney(record.marked_money || record.money);

        return {
          drugs: acc.drugs + drugs,
          weapons: acc.weapons + weapons,
          ammo: acc.ammo + ammo,
          bombs: acc.bombs + bombs,
          lockpicks: acc.lockpicks + lockpicks,
          money: acc.money + money
        };
      }, { drugs: 0, weapons: 0, ammo: 0, bombs: 0, lockpicks: 0, money: 0 });

      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Falha ao carregar dados estatísticos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    const channel = supabase
      .channel('public:rso_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rso' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
        <p className="text-white/50 text-sm tracking-widest uppercase animate-pulse">Carregando estatísticas operacionais...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[400px] text-center px-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-white font-bold text-lg mb-2">Erro de Conexão</h3>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <Button onClick={fetchStats} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
          >
            4° BPCHQ COE <span className="text-green-500">EM NÚMEROS</span>
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="h-1 w-24 bg-green-500 mx-auto rounded-full" 
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-white/40 text-xs md:text-sm tracking-[0.2em] uppercase font-medium"
          >
            Produtividade Operacional Acumulada
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Row 1 */}
          <StatCard 
            label="Drogas Apreendidas" 
            sublabel="(KG)" 
            value={stats.drugs} 
            delay={0.1}
          />
          <StatCard 
            label="Armamento" 
            sublabel="Apreendido" 
            value={stats.weapons} 
            delay={0.2}
          />
          <StatCard 
            label="Munição" 
            sublabel="Apreendida" 
            value={stats.ammo} 
            delay={0.3}
          />
          
          {/* Row 2 */}
          <StatCard 
            label="Bombas" 
            sublabel="Apreendidas" 
            value={stats.bombs} 
            delay={0.4}
          />
          <StatCard 
            label="Lockpicks" 
            sublabel="Apreendidas" 
            value={stats.lockpicks} 
            delay={0.5}
          />
          <StatCard 
            label="Dinheiro" 
            sublabel="Apreendido" 
            value={stats.money} 
            isCurrency 
            delay={0.6}
          />
        </div>

        {/* Footer Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-green-500/20 bg-green-500/5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] text-green-500 font-bold tracking-widest uppercase">
              Dados atualizados em tempo real
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;