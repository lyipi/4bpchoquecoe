import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Shield, Gavel, Bomb, Key, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

const ItemRow = ({ icon: Icon, label, value, isCurrency = false, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5 hover:border-green-500/30"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-slate-900 text-green-400">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </div>
    <span className="font-bold text-white tabular-nums">
      {isCurrency 
        ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : value.toLocaleString('pt-BR')
      }
    </span>
  </motion.div>
);

const ItemBreakdownCard = ({ stats }) => {
  const items = [
    { id: 'drugs', label: 'Drogas (KG)', value: stats.drugs, icon: Package },
    { id: 'weapons', label: 'Armas', value: stats.weapons, icon: Shield },
    { id: 'money', label: 'Dinheiro', value: stats.money, icon: Banknote, isCurrency: true },
    { id: 'bombs', label: 'Bombas', value: stats.bombs, icon: Bomb },
    { id: 'lockpicks', label: 'Lockpicks', value: stats.lockpicks, icon: Key },
    { id: 'detained', label: 'Detidos', value: stats.detained, icon: Gavel },
  ];

  return (
    <Card className="bg-slate-900 border-green-500/30 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-green-400" />
          Detalhamento de Apreensões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {items.map((item, idx) => (
            <ItemRow 
              key={item.id}
              icon={item.icon}
              label={item.label}
              value={item.value || 0}
              isCurrency={item.isCurrency}
              delay={idx}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemBreakdownCard;