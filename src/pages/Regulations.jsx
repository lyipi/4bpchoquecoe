import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ExternalLink, FileText, ArrowLeft, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RegulationModal from '@/components/RegulationModal';

const Regulations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState(null);
  
  const { hasRole } = useAuth();
  const { toast } = useToast();
  
  // Define admin access - assuming 'Administrativos' and 'Super Administrativo' can edit
  const isAdmin = hasRole(['Administrativos', 'Super Administrativo']);

  useEffect(() => {
    fetchRegulations();
    setupRealtimeSubscription();
  }, []);

  const fetchRegulations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'regulations')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.setting_value) {
        // Ensure it's an array
        setRegulations(Array.isArray(data.setting_value) ? data.setting_value : []);
      } else {
        setRegulations([]);
      }
    } catch (error) {
      console.error('Error fetching regulations:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os regulamentos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('regulations_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_settings',
          filter: "setting_key=eq.regulations"
        },
        (payload) => {
          if (payload.new && payload.new.setting_value) {
            setRegulations(payload.new.setting_value);
            toast({
              title: 'Atualizado',
              description: 'A lista de regulamentos foi atualizada.',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSaveRegulation = async (formData) => {
    let updatedRegulations;
    
    if (editingRegulation) {
      // Edit existing
      updatedRegulations = regulations.map(reg => 
        reg.id === editingRegulation.id 
          ? { ...formData, id: editingRegulation.id, updated_at: new Date().toISOString() } 
          : reg
      );
    } else {
      // Create new
      updatedRegulations = [
        ...regulations, 
        { ...formData, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      ];
    }

    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          setting_key: 'regulations', 
          setting_value: updatedRegulations,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: editingRegulation ? 'Regulamento Atualizado' : 'Regulamento Criado',
        description: 'As alterações foram salvas com sucesso.',
      });
      
      // Optimistic update (backup if realtime is slow)
      setRegulations(updatedRegulations);
      setIsModalOpen(false);
      setEditingRegulation(null);
    } catch (error) {
      console.error('Error saving regulation:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as alterações.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRegulation = async (id) => {
    const updatedRegulations = regulations.filter(reg => reg.id !== id);

    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: updatedRegulations,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'regulations');

      if (error) throw error;

      toast({
        title: 'Regulamento Removido',
        description: 'O regulamento foi excluído com sucesso.',
      });
      
      setRegulations(updatedRegulations);
    } catch (error) {
      console.error('Error deleting regulation:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Ocorreu um erro ao excluir o regulamento.',
        variant: 'destructive'
      });
    }
  };

  const openNewModal = () => {
    setEditingRegulation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reg) => {
    setEditingRegulation(reg);
    setIsModalOpen(true);
  };

  const filteredRegulations = regulations.filter(reg =>
    reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-[#5FD068]" />
          <h1 className="text-3xl font-bold text-white">Regulamentos</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a8a9ad]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar documento..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-[#5FD068]/30 rounded-full text-white placeholder-[#a8a9ad] focus:outline-none focus:border-[#5FD068] transition-colors"
            />
          </div>
          
          {isAdmin && (
            <Button 
              onClick={openNewModal}
              className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Regulamento
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#a8a9ad]">
          <RefreshCw className="w-10 h-10 animate-spin mb-4 text-[#5FD068]" />
          <p>Carregando regulamentos...</p>
        </div>
      ) : filteredRegulations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#a8a9ad]/20 rounded-xl bg-[#1a1a1a]/50">
          <FileText className="w-12 h-12 text-[#a8a9ad] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">Nenhum regulamento encontrado</h3>
          <p className="text-[#a8a9ad] mt-1">Tente ajustar sua busca ou adicione novos documentos.</p>
          {isAdmin && (
            <Button variant="link" onClick={openNewModal} className="text-[#5FD068] mt-4">
              Adicionar Regulamento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRegulations.map((reg, idx) => (
              <motion.div
                key={reg.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col bg-[#1a1a1a] rounded-xl border border-[#a8a9ad]/20 hover:border-[#5FD068] transition-all relative overflow-hidden h-full shadow-lg"
              >
                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-[#5FD068]/10 rounded-lg flex items-center justify-center group-hover:bg-[#5FD068]/20 transition-colors">
                      <FileText className="w-6 h-6 text-[#5FD068]" />
                    </div>
                    
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border ${
                      reg.category === 'Operacional' ? 'border-red-900/50 text-red-400 bg-red-900/10' :
                      reg.category === 'Administrativo' ? 'border-blue-900/50 text-blue-400 bg-blue-900/10' :
                      reg.category === 'Disciplinar' ? 'border-yellow-900/50 text-yellow-400 bg-yellow-900/10' :
                      'border-[#a8a9ad]/30 text-[#a8a9ad] bg-[#a8a9ad]/10'
                    }`}>
                      {reg.category || 'Geral'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#5FD068] transition-colors line-clamp-2">
                    {reg.title}
                  </h3>
                  
                  <p className="text-sm text-[#a8a9ad] leading-relaxed line-clamp-3 mb-6 flex-1">
                    {reg.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-[#a8a9ad]/10">
                     {reg.url ? (
                       <a
                         href={reg.url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-black/40 hover:bg-[#5FD068] text-white hover:text-black rounded-lg text-sm font-medium transition-all"
                       >
                         <ExternalLink className="w-4 h-4 mr-2" /> Acessar
                       </a>
                     ) : (
                       <span className="flex-1 text-center text-xs text-[#a8a9ad] italic py-2">Sem link externo</span>
                     )}
                  </div>
                </div>

                {/* Admin Actions Overlay */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg p-1 backdrop-blur-sm">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => openEditModal(reg)}
                      className="h-8 w-8 text-[#5FD068] hover:bg-[#5FD068]/20 hover:text-[#5FD068]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-red-500 hover:bg-red-900/20 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1a1a] border border-[#a8a9ad]/20 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Regulamento?</AlertDialogTitle>
                          <AlertDialogDescription className="text-[#a8a9ad]">
                            Você tem certeza que deseja remover "{reg.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border border-[#a8a9ad]/20 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteRegulation(reg.id)}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Return to Home Button */}
      <div className="flex justify-center pt-8 border-t border-[#a8a9ad]/10">
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black font-semibold transition-all px-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Home
        </Button>
      </div>

      <RegulationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRegulation}
        initialData={editingRegulation}
      />
    </div>
  );
};

export default Regulations;