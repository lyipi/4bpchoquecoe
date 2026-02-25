import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const ExportDataPanel = () => {
  const { toast } = useToast();
  const [loadingRSO, setLoadingRSO] = useState(false);
  const [loadingPonto, setLoadingPonto] = useState(false);

  const exportToExcel = (data, fileName) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
      
      // Auto-width columns roughly
      const max_width = data.reduce((w, r) => Math.max(w, JSON.stringify(r).length), 10);
      worksheet["!cols"] = [ { wch: max_width } ];

      XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
      
      toast({
        title: "Exportação Concluída",
        description: `Arquivo ${fileName} baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o arquivo Excel.",
        variant: "destructive"
      });
    }
  };

  const handleExportRSO = async () => {
    setLoadingRSO(true);
    const { data, error } = await supabase.from('rso').select('*');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar dados do RSO', variant: 'destructive' });
    } else if (!data || data.length === 0) {
      toast({ title: 'Sem dados', description: 'Não há registros de RSO para exportar.', variant: 'warning' });
    } else {
      exportToExcel(data, "RSO_Relatorio");
    }
    setLoadingRSO(false);
  };

  const handleExportBatePonto = async () => {
    setLoadingPonto(true);
    const { data, error } = await supabase.from('bate_ponto').select('*');
    
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao buscar dados de Ponto', variant: 'destructive' });
    } else if (!data || data.length === 0) {
        toast({ title: 'Sem dados', description: 'Não há registros de Ponto para exportar.', variant: 'warning' });
    } else {
      exportToExcel(data, "BatePonto_Relatorio");
    }
    setLoadingPonto(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
         <FileSpreadsheet className="w-6 h-6 text-blue-400" />
         <div>
            <h3 className="text-xl font-bold text-blue-400">Central de Exportação de Dados</h3>
            <p className="text-xs text-blue-300">Baixe relatórios completos em formato Excel (.xlsx) para auditoria e controle.</p>
         </div>
       </div>
       
       <div className="grid md:grid-cols-2 gap-6">
          {/* RSO Export Card */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#a8a9ad]/20 hover:border-[#5FD068]/50 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h4 className="text-lg font-bold text-white">Relatório de RSO</h4>
                   <p className="text-sm text-[#a8a9ad]">Registros de Ocorrências e Operações</p>
                </div>
                <FileSpreadsheet className="w-8 h-8 text-[#5FD068] opacity-50" />
             </div>
             <p className="text-xs text-[#a8a9ad] mb-6">
                Exporta todos os dados de RSO incluindo autores, apreensões, detidos e detalhes da operação.
             </p>
             <Button 
                onClick={handleExportRSO} 
                disabled={loadingRSO}
                className="w-full bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black transition-colors"
             >
                {loadingRSO ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {loadingRSO ? 'Gerando Arquivo...' : 'Baixar Planilha RSO'}
             </Button>
          </div>

          {/* Bate-Ponto Export Card */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#a8a9ad]/20 hover:border-[#5FD068]/50 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h4 className="text-lg font-bold text-white">Relatório de Ponto</h4>
                   <p className="text-sm text-[#a8a9ad]">Histórico de Jornada de Trabalho</p>
                </div>
                <FileSpreadsheet className="w-8 h-8 text-[#5FD068] opacity-50" />
             </div>
             <p className="text-xs text-[#a8a9ad] mb-6">
                Exporta histórico completo de entradas e saídas, duração de turnos e status de aprovação.
             </p>
             <Button 
                onClick={handleExportBatePonto} 
                disabled={loadingPonto}
                className="w-full bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black transition-colors"
             >
                {loadingPonto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {loadingPonto ? 'Gerando Arquivo...' : 'Baixar Planilha Ponto'}
             </Button>
          </div>
       </div>
    </div>
  );
};

export default ExportDataPanel;