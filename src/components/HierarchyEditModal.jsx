import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const RANKS = [
  'Coronel', 'Tenente Coronel', 'Major', 'Capitão', 
  '1º Tenente', '2º Tenente', 'Aspirante a Oficial', 
  'Sub Tenente', '1º Sargento', '2º Sargento', '3º Sargento', 'Aluno a Sargento',
  'Cabo', 'Soldado 1ª Classe', 'Soldado 2ª Classe'
];

const FUNCTIONS = [
  'Comandante', 'Sub Comandante', 'Coordenador', 'Coordenador de Estágio', 'Coordenador Operacional', 'Coordenador Administrativo', 'Comandante da 1° CIA', 'Comandante da 2° CIA',
  'Administrativo', 'Instrutor', 'Operacional', 'Estágio', 
];

const SPECIALIZATIONS = [
  { id: 'cdd', label: 'CDD' },
  { id: 'sat_b', label: 'SAT-B' },
  { id: 'tb', label: 'T.B' },
  { id: 'ta', label: 'T.A' },
  { id: 'mod_bopm', label: 'MOD/BOPM' },
  { id: 'pop', label: 'POP' },
  { id: 'abord', label: 'ABORD' },
];

const HierarchyEditModal = ({ isOpen, onClose, officerToEdit, onSave }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    serial: '',
    cpf: '',
    discord_id: '',
    rank: '',
    function: '',
    promotion_date: '',
    entry_date: '',
    cdd: false,
    sat_b: false,
    tb: false,
    ta: false,
    mod_bopm: false,
    pop: false,
    abord: false,
    insignia_image_url: '',
    laurea_image_url: '',
    courses_images: []
  });

  useEffect(() => {
    if (officerToEdit) {
      setFormData({
        full_name: officerToEdit.full_name || '',
        serial: officerToEdit.serial || officerToEdit.serial_number || '',
        cpf: officerToEdit.cpf || '',
        discord_id: officerToEdit.discord_id || '',
        rank: officerToEdit.rank || '',
        function: officerToEdit.function || '',
        promotion_date: officerToEdit.promotion_date || '',
        entry_date: officerToEdit.entry_date || '',
        cdd: officerToEdit.cdd || false,
        sat_b: officerToEdit.sat_b || false,
        tb: officerToEdit.tb || false,
        ta: officerToEdit.ta || false,
        mod_bopm: officerToEdit.mod_bopm || false,
        pop: officerToEdit.pop || false,
        abord: officerToEdit.abord || false,
        insignia_image_url: officerToEdit.insignia_image_url || '',
        laurea_image_url: officerToEdit.laurea_image_url || '',
        courses_images: Array.isArray(officerToEdit.courses_images) ? officerToEdit.courses_images : []
      });
    } else {
      setFormData({
        full_name: '', serial: '', cpf: '', discord_id: '',
        rank: '', function: '', promotion_date: '', entry_date: '',
        cdd: false, sat_b: false, tb: false, ta: false, mod_bopm: false, pop: false, abord: false,
        insignia_image_url: '', laurea_image_url: '', courses_images: []
      });
    }
  }, [officerToEdit, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, field) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      if (field === 'courses_images') {
        if (formData.courses_images.length + files.length > 6) {
          toast({ title: "Limite excedido", description: "Máximo de 6 imagens para cursos.", variant: "destructive" });
          return;
        }
        
        const newUrls = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `courses/${fileName}`;

          const { error: uploadError } = await supabase.storage.from('hierarchy-images').upload(filePath, file);
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('hierarchy-images').getPublicUrl(filePath);
          newUrls.push(publicUrlData.publicUrl);
        }
        setFormData(prev => ({ ...prev, courses_images: [...prev.courses_images, ...newUrls] }));

      } else {
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${field}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('hierarchy-images').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('hierarchy-images').getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, [field]: publicUrlData.publicUrl }));
      }
      
      toast({ title: "Upload concluído" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeCourseImage = (index) => {
    setFormData(prev => ({
      ...prev,
      courses_images: prev.courses_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.rank) {
      toast({ title: "Campos obrigatórios", description: "Nome Completo e Patente são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.full_name, // Maintain backward compatibility if needed, but 'name' field is removed from UI
        serial_number: formData.serial
      };

      if (officerToEdit?.id) {
        const { error } = await supabase.from('hierarchy').update(payload).eq('id', officerToEdit.id);
        if (error) throw error;
        toast({ title: "Oficial atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from('hierarchy').insert([payload]);
        if (error) throw error;
        toast({ title: "Oficial adicionado com sucesso!" });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-green-500/20 text-white max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-400">
            {officerToEdit ? 'Editar Oficial' : 'Adicionar Novo Oficial'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Preencha os dados completos do militar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-800 pb-6">
            <h3 className="col-span-full text-sm font-bold text-green-500 uppercase mb-2">Dados Pessoais</h3>
            
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input name="cpf" value={formData.cpf} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>SERIAL</Label>
              <Input name="serial" value={formData.serial} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
             <div className="space-y-2 col-span-2">
              <Label>Nome Completo</Label>
              <Input name="full_name" value={formData.full_name} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
             <div className="space-y-2 col-span-2">
              <Label>Discord ID</Label>
              <Input name="discord_id" value={formData.discord_id} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-800 pb-6">
            <h3 className="col-span-full text-sm font-bold text-green-500 uppercase mb-2">Dados Militares</h3>
             <div className="space-y-2">
              <Label>Graduação</Label>
              <Select value={formData.rank} onValueChange={(val) => handleSelectChange('rank', val)}>
                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={formData.function} onValueChange={(val) => handleSelectChange('function', val)}>
                <SelectTrigger className="bg-slate-800 border-slate-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">{FUNCTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Promoção</Label>
              <Input type="date" name="promotion_date" value={formData.promotion_date} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label>Data Entrada</Label>
              <Input type="date" name="entry_date" value={formData.entry_date} onChange={handleInputChange} className="bg-slate-800 border-slate-700" />
            </div>
          </div>

          <div className="border-b border-slate-800 pb-6">
            <h3 className="text-sm font-bold text-green-500 uppercase mb-4">Cursos e Especializações</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {SPECIALIZATIONS.map(spec => (
                <div key={spec.id} className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded border border-slate-700">
                  <Checkbox 
                    id={spec.id} 
                    checked={formData[spec.id]} 
                    onCheckedChange={(checked) => handleCheckboxChange(spec.id, checked)}
                    className="data-[state=checked]:bg-green-600 border-slate-500"
                  />
                  <label htmlFor={spec.id} className="text-sm font-medium leading-none cursor-pointer text-slate-300 select-none">
                    {spec.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-green-500 uppercase">Imagens e Documentos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>PATENTE (Imagem da Insígnia)</Label>
                <div className="flex items-center gap-4">
                  {formData.insignia_image_url && <img src={formData.insignia_image_url} alt="Patente" className="w-12 h-12 object-contain bg-slate-800 rounded p-1" />}
                  <div className="flex-1">
                     <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'insignia_image_url')} disabled={uploading} className="bg-slate-800 border-slate-700 text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Láurea</Label>
                <div className="flex items-center gap-4">
                  {formData.laurea_image_url && <img src={formData.laurea_image_url} alt="Láurea" className="w-12 h-12 object-contain bg-slate-800 rounded p-1" />}
                  <div className="flex-1">
                     <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'laurea_image_url')} disabled={uploading} className="bg-slate-800 border-slate-700 text-xs" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagens de Cursos (Máx 6)</Label>
              <Input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={(e) => handleFileUpload(e, 'courses_images')} 
                disabled={uploading || formData.courses_images.length >= 6}
                className="bg-slate-800 border-slate-700" 
              />
              <div className="grid grid-cols-6 gap-2 mt-2">
                {formData.courses_images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square bg-slate-800 rounded overflow-hidden">
                    <img src={url} alt={`Curso ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeCourseImage(idx)}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">Cancelar</Button>
            <Button type="submit" disabled={loading || uploading} className="bg-green-600 text-white hover:bg-green-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HierarchyEditModal;