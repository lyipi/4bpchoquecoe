import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const AnimatedNumber = ({ value, isCurrency = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  
  // Clean value
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]+/g, "")) 
    : value;
    
  const finalValue = isNaN(numericValue) ? 0 : numericValue;

  const spring = useSpring(0, { mass: 1, stiffness: 60, damping: 20 });
  const display = useTransform(spring, (current) => {
    if (isCurrency) {
      return `R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return Math.floor(current).toLocaleString('pt-BR');
  });

  useEffect(() => {
    if (inView) {
      spring.set(finalValue);
    }
  }, [inView, finalValue, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

const StatCard = ({ label, value, icon: Icon, sublabel, isCurrency = false, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn(
        "bg-slate-900 border-green-500/30 shadow-lg shadow-green-900/10 hover:shadow-green-500/10 transition-all duration-300 overflow-hidden relative group",
        className
      )}>
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</h3>
            {Icon && (
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className={cn(
              "text-3xl font-bold text-white tracking-tight",
              isCurrency ? "text-2xl" : "text-3xl"
            )}>
              <AnimatedNumber value={value} isCurrency={isCurrency} />
            </div>
            
            {sublabel && (
              <p className="text-xs text-green-500/80 font-medium">
                {sublabel}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;