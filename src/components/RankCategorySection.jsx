import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import HierarchyTableRow from './HierarchyTableRow';
import { Badge } from '@/components/ui/badge';

// Course Headers for the main table header
const COURSE_HEADERS = ['SAT-A', 'SAT-B', 'T.B', 'T.A', 'MOD', 'ABOR', 'POP'];
const LAUREL_HEADERS = ['🥉', '🥈', '🥇', '💎', '👑']; // Visual representation in header

const RankCategorySection = ({ title, officers, onEdit, isAdmin }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!officers || officers.length === 0) return null;

  return (
    <div className="mb-8 rounded-lg border border-slate-800 bg-slate-950/50 overflow-hidden shadow-lg">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 bg-slate-900/80 hover:bg-slate-800 transition-colors border-b border-slate-800"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200 flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="bg-slate-800 text-green-400 border-0 ml-2 text-[10px] h-5">
            {officers.length} Policiais
          </Badge>
        </h3>
        
        {/* Header Legend Preview (Optional, keeps it clean) */}
        <div className="ml-auto hidden md:flex items-center gap-4 text-[10px] text-slate-500 font-mono uppercase">
           <span>Total Vagas: --</span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="p-3 w-16">CPF/ID</th>
                  <th className="p-3 w-20">Serial</th>
                  <th className="p-3 min-w-[150px]">Nome</th>
                  <th className="p-3 w-32">Discord ID</th>
                  <th className="p-3 text-center w-16">Insignia</th>
                  <th className="p-3 text-center min-w-[100px]">Graduação</th>
                  <th className="p-3 min-w-[100px]">Função</th>
                  <th className="p-3 text-center w-24">Promoção</th>
                  <th className="p-3 text-center w-24">Entrada</th>
                  
                  {/* Course Headers */}
                  {COURSE_HEADERS.map(h => (
                    <th key={h} className="p-3 text-center w-10 text-[9px]">{h}</th>
                  ))}

                  {/* Laurel Headers */}
                  {LAUREL_HEADERS.map((h, i) => (
                    <th key={i} className="p-3 text-center w-8 text-base">{h}</th>
                  ))}

                  <th className="p-3 text-right w-24">Edital/Ação</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer, index) => (
                  <HierarchyTableRow 
                    key={officer.id} 
                    officer={officer} 
                    onEdit={onEdit}
                    isAdmin={isAdmin}
                    isEven={index % 2 === 0}
                  />
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RankCategorySection;