import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Save, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const RegulationManagement = () => {
  const { toast } = useToast();
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReg, setCurrentReg] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Geral'
  });

  useEffect(() => {
    fetchRegulations();
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
         // PGRST116 means no rows found, which is fine for first load
         console.error('Error fetching regulations:', error);
         toast({ title: 'Erro', description: 'Erro ao carregar regulamentos', variant: 'destructive' });
      } else if (data && data.setting_value) {
         setRegulations(data.setting_value);
      } else {
         setRegulations([]);
      }
    } catch (error) {
      console.error('Unexpected error fetching regulations:', error);
    }
    setLoading(false);
  };

  const saveToDb = async (newRegulations) => {
    // Check if the row exists first by trying to select, or just upsert
    // Supabase upsert requires a primary key or unique constraint. admin_settings probably has an id.
    // We should rely on setting_key being unique if the table was set up that way, or just check existing.
    
    // First, try to see if the record exists
    const { data: existingData } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'regulations')
        .single();

    let error;
    
    if (existingData) {
        // Update
        const result = await supabase
            .from('admin_settings')
            .update({ 
                setting_value: newRegulations,
                updated_at: new Date().toISOString()
            })
            .eq('setting_key', 'regulations');
        error = result.error;
    } else {
        // Insert
        const result = await supabase
            .from('admin_settings')
            .insert({ 
                setting_key: 'regulations', 
                setting_value: newRegulations,
                updated_at: new Date().toISOString()
            });
         error = result.error;
    }
    
    if (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao salvar no banco de dados', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    let updatedRegs;
    if (currentReg) {
      // Update existing
      updatedRegs = regulations.map(r => r.id === currentReg.id ? { ...formData, id: currentReg.id } : r);
    } else {
      // Create new
      updatedRegs = [...regulations, { ...formData, id: Date.now() }];
    }

    const success = await saveToDb(updatedRegs);
    if (success) {
      setRegulations(updatedRegs);
      toast({ title: currentReg ? 'Regulamento atualizado' : 'Regulamento adicionado', variant: 'default' });
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Deseja realmente excluir este regulamento?")) return;
    
    const updatedRegs = regulations.filter(r => r.id !== id);
    const success = await saveToDb(updatedRegs);
    if (success) {
      setRegulations(updatedRegs);
      toast({ title: 'Regulamento removido', variant: 'destructive' });
    }
  };

  const startEdit = (reg) => {
    setCurrentReg(reg);
    setFormData({
        title: reg.title || '',
        description: reg.description || '',
        url: reg.url || '',
        category: reg.category || 'Geral'
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentReg(null);
    setFormData({ title: '', description: '', url: '', category: 'Geral' });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 bg-[#1a1a1a] p-6 rounded-xl border border-[#a8a9ad]/20">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#5FD068]" /> Gerenciar Regulamentos
        </h3>
        <Button onClick={() => { resetForm(); setIsEditing(true); }} className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black">
          <Plus className="w-4 h-4 mr-2" /> Novo Regulamento
        </Button>
      </div>

      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-black p-4 rounded-lg border border-[#5FD068]/30 space-y-4 mb-6"
        >
          <div>
            <label className="text-xs text-[#a8a9ad] mb-1 block">Título do Regulamento *</label>
            <input 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#a8a9ad]/30 rounded p-2 text-white focus:border-[#5FD068] outline-none transition-colors"
              placeholder="Ex: Regulamento Interno 2024"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad] mb-1 block">Categoria</label>
            <select
               value={formData.category}
               onChange={e => setFormData({...formData, category: e.target.value})}
               className="w-full bg-[#1a1a1a] border border-[#a8a9ad]/30 rounded p-2 text-white focus:border-[#5FD068] outline-none"
            >
               <option value="Geral">Geral</option>
               <option value="Operacional">Operacional</option>
               <option value="Administrativo">Administrativo</option>
               <option value="Disciplinar">Disciplinar</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad] mb-1 block">Descrição</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#a8a9ad]/30 rounded p-2 text-white h-20 resize-none focus:border-[#5FD068] outline-none"
              placeholder="Breve descrição do documento..."
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad] mb-1 block">URL do Documento</label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-10 bg-[#1a1a1a] border border-[#a8a9ad]/30 rounded-l border-r-0 text-[#a8a9ad]">
                  <LinkIcon className="w-4 h-4" />
              </div>
              <input 
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                placeholder="https://docs.google.com/..."
                className="w-full bg-[#1a1a1a] border border-[#a8a9ad]/30 rounded-r p-2 text-white focus:border-[#5FD068] outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">Cancelar</Button>
            <Button onClick={handleSave} className="bg-[#5FD068] text-black hover:bg-[#4ab853]">
              <Save className="w-4 h-4 mr-2" /> {currentReg ? 'Salvar Alterações' : 'Criar Regulamento'}
            </Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[#a8a9ad] animate-pulse">Carregando regulamentos...</div>
      ) : (
        <div className="space-y-3">
            {regulations.length === 0 && (
                <div className="text-center py-8 text-[#a8a9ad] italic bg-black/30 rounded border border-white/5">Nenhum regulamento cadastrado.</div>
            )}
            {regulations.map(reg => (
            <div key={reg.id} className="flex items-center justify-between p-4 bg-black/40 rounded border border-[#a8a9ad]/10 hover:border-[#5FD068]/30 transition-all group">
                <div className="overflow-hidden flex-1 mr-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                        reg.category === 'Operacional' ? 'bg-red-900/30 text-red-400' :
                        reg.category === 'Administrativo' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-[#5FD068]/20 text-[#5FD068]'
                    }`}>{reg.category}</span>
                    <p className="font-bold text-white truncate text-sm">{reg.title}</p>
                </div>
                <p className="text-xs text-[#a8a9ad] truncate mb-1">{reg.description || 'Sem descrição'}</p>
                {reg.url && (
                    <a href={reg.url} target="_blank" rel="noreferrer" className="text-xs text-[#5FD068] hover:underline truncate inline-flex items-center gap-1 opacity-70 hover:opacity-100">
                    <LinkIcon className="w-3 h-3" /> Acessar Documento
                    </a>
                )}
                </div>
                <div className="flex gap-2 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" onClick={() => startEdit(reg)} className="h-8 w-8 text-[#5FD068] hover:bg-[#5FD068]/10">
                    <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(reg.id)} className="h-8 w-8 text-red-500 hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                </Button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RegulationManagement;