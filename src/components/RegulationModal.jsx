import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RegulationModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Geral'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        url: initialData.url || '',
        category: initialData.category || 'Geral'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        url: '',
        category: 'Geral'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#a8a9ad]/20 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {initialData ? 'Editar Regulamento' : 'Novo Regulamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a8a9ad]">Título</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/50 border border-[#a8a9ad]/30 rounded-lg px-3 py-2 text-white focus:border-[#5FD068] focus:outline-none transition-colors"
              placeholder="Ex: Regulamento Interno"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a8a9ad]">Categoria</label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="w-full bg-black/50 border border-[#a8a9ad]/30 text-white focus:ring-[#5FD068]">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#a8a9ad]/20 text-white">
                <SelectItem value="Geral">Geral</SelectItem>
                <SelectItem value="Operacional">Operacional</SelectItem>
                <SelectItem value="Administrativo">Administrativo</SelectItem>
                <SelectItem value="Disciplinar">Disciplinar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a8a9ad]">Link do Documento (URL)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-black/50 border border-[#a8a9ad]/30 rounded-lg px-3 py-2 text-white focus:border-[#5FD068] focus:outline-none transition-colors"
              placeholder="https://docs.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a8a9ad]">Descrição</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 bg-black/50 border border-[#a8a9ad]/30 rounded-lg px-3 py-2 text-white focus:border-[#5FD068] focus:outline-none transition-colors resize-none"
              placeholder="Breve descrição do conteúdo..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#a8a9ad]/30 text-[#a8a9ad] hover:text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegulationModal;