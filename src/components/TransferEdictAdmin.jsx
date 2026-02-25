import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  User, 
  Hash, 
  Shield, 
  Phone, 
  MessageSquare,
  FileInput
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const TransferEdictAdmin = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [edicts, setEdicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEdicts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('transfer_edict')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEdicts(data || []);
    } catch (err) {
      console.error('Error fetching transfer edicts:', err);
      setError('Falha ao carregar os editais. Por favor, tente novamente.');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os editais de transferência.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hasRole(['Administrativos', 'Super Administrativo'])) {
      fetchEdicts();
    } else {
      setLoading(false);
    }
  }, [hasRole, fetchEdicts]);

  // Access control check
  if (!hasRole(['Administrativos', 'Super Administrativo'])) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-900/10 border border-red-900/30 rounded-lg">
        <Shield className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-400">Acesso Negado</h2>
        <p className="text-red-300/70">Você não tem permissão para visualizar os editais de transferência.</p>
      </div>
    );
  }

  const filteredEdicts = edicts.filter(edict => {
    const term = searchTerm.toLowerCase();
    return (
      (edict.full_name?.toLowerCase() || '').includes(term) ||
      (edict.cpf?.includes(term)) ||
      (edict.discord_id?.toLowerCase() || '').includes(term)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111] p-6 rounded-lg border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FileInput className="w-6 h-6 text-[#5FD068]" />
            Editais de Transferência
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gerenciamento e visualização de solicitações de transferência.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, CPF ou Discord..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:ring-[#5FD068]"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchEdicts}
            className="border-white/10 hover:bg-white/5 hover:text-[#5FD068]"
            title="Atualizar lista"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-[#5FD068]" />
            <p>Carregando editais...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p className="mb-4">{error}</p>
            <Button onClick={fetchEdicts} variant="outline" className="border-red-900/30 hover:bg-red-900/10">
              Tentar Novamente
            </Button>
          </div>
        ) : filteredEdicts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">Nenhum edital encontrado</p>
            {searchTerm && <p className="text-sm mt-2">Tente buscar com outros termos.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-xs font-bold text-slate-400 uppercase border-b border-white/5">
                <tr>
                  <th className="p-4 whitespace-nowrap"><User className="w-3 h-3 inline mr-1" /> Nome / CPF</th>
                  <th className="p-4 whitespace-nowrap"><Shield className="w-3 h-3 inline mr-1" /> Patente / Unidade</th>
                  <th className="p-4 whitespace-nowrap"><Phone className="w-3 h-3 inline mr-1" /> Contato</th>
                  <th className="p-4 w-1/3 min-w-[300px]"><MessageSquare className="w-3 h-3 inline mr-1" /> Justificativa</th>
                  <th className="p-4 whitespace-nowrap text-right"><Calendar className="w-3 h-3 inline mr-1" /> Data Envio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredEdicts.map((edict) => (
                  <motion.tr 
                    key={edict.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="p-4 align-top">
                      <div className="font-medium text-white">{edict.full_name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {edict.cpf}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-slate-300">{edict.rank}</div>
                      <div className="text-xs text-slate-500 mt-1 bg-slate-900/50 inline-block px-2 py-0.5 rounded">
                        {edict.unit}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-slate-400 text-xs space-y-1">
                        <div className="flex items-center gap-2" title="Telefone">
                          <Phone className="w-3 h-3" /> {edict.phone}
                        </div>
                        <div className="flex items-center gap-2" title="Discord">
                          <MessageSquare className="w-3 h-3" /> {edict.discord_id}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-slate-300 text-xs leading-relaxed max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                        {edict.justification}
                      </p>
                    </td>
                    <td className="p-4 align-top text-right text-slate-500 font-mono text-xs">
                      {formatDate(edict.created_at)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="text-xs text-slate-600 text-right">
        Total de registros: {filteredEdicts.length}
      </div>
    </div>
  );
};

export default TransferEdictAdmin;