import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HoursRankingTable from '@/components/HoursRankingTable';
import ItemsRankingTable from '@/components/ItemsRankingTable';
import { ArrowLeft, Trophy, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RankingsPage = () => {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="text-slate-400 hover:text-white px-0" onClick={() => window.location.href = '/'}>
             <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
           </Button>
           <div>
             <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-[#5FD068]" /> Central de Rankings
             </h1>
             <p className="text-slate-500 mt-1">Acompanhe o desempenho e estatísticas de todo o efetivo.</p>
           </div>
        </div>
      </div>

      <Tabs defaultValue="hours" className="w-full space-y-6">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto gap-2">
          <TabsTrigger value="hours" className="data-[state=active]:bg-[#5FD068] data-[state=active]:text-black py-2.5 font-bold transition-all">
            <Clock className="w-4 h-4 mr-2" /> Ranking de Horas
          </TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-[#5FD068] data-[state=active]:text-black py-2.5 font-bold transition-all">
            <Package className="w-4 h-4 mr-2" /> Ranking de Apreensões
          </TabsTrigger>
        </TabsList>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
        >
          <TabsContent value="hours" className="m-0 focus-visible:outline-none">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-1 md:p-6 shadow-2xl">
               <div className="mb-6 px-2">
                 <h2 className="text-xl font-bold text-white mb-2">Ranking Global de Horas</h2>
                 <p className="text-slate-400 text-sm">Somatório total de horas aprovadas em patrulhamento de todos os militares.</p>
               </div>
               <HoursRankingTable />
            </div>
          </TabsContent>

          <TabsContent value="items" className="m-0 focus-visible:outline-none">
             <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-1 md:p-6 shadow-2xl">
               <div className="mb-6 px-2">
                 <h2 className="text-xl font-bold text-white mb-2">Ranking de Apreensões</h2>
                 <p className="text-slate-400 text-sm">Contagem total de materiais apreendidos em ocorrências aprovadas (RSO).</p>
               </div>
               <ItemsRankingTable />
            </div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default RankingsPage;