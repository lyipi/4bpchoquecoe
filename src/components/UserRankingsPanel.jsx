import React from 'react';
import HoursRankingTable from './HoursRankingTable';
import ItemsRankingTable from './ItemsRankingTable';
import { Trophy } from 'lucide-react';

const UserRankingsPanel = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3 p-2">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Rankings Operacionais</h2>
          <p className="text-xs text-slate-400">Classificação em tempo real baseada em relatórios e ponto eletrônico</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <div className="h-[600px] xl:h-auto">
          <HoursRankingTable />
        </div>
        <div className="h-[600px] xl:h-auto">
          <ItemsRankingTable />
        </div>
      </div>
    </div>
  );
};

export default UserRankingsPanel;