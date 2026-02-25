import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  FileText,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const GalleryAdmin = () => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // List files from 'gallery-images' bucket
      const { data, error } = await supabase
        .storage
        .from('gallery-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const galleryItems = data
        .filter(item => item.name !== '.emptyFolderPlaceholder')
        .map(item => {
          const { data: { publicUrl } } = supabase.storage
            .from('gallery-images')
            .getPublicUrl(item.name);
            
          return {
            id: item.id,
            name: item.name,
            image_url: publicUrl,
            created_at: item.created_at,
            size: item.metadata?.size
          };
        });

      setItems(galleryItems);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      toast({
        title: "Erro",
        description: "Falha ao carregar itens da galeria.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      // Upload image to Storage 'gallery-images'
      // Sanitize filename to avoid issues
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
      
      fetchItems();
    } catch (err) {
      console.error('Error uploading image:', err);
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar a imagem. Verifique as permissões.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileName) => {
    if (!window.confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      // Optimistic update
      setItems(items.filter(item => item.name !== fileName));

      const { error } = await supabase
        .storage
        .from('gallery-images')
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: "Excluído",
        description: "Imagem removida da galeria.",
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Erro",
        description: "Falha ao excluir imagem.",
        variant: "destructive"
      });
      fetchItems(); // Revert on error
    }
  };

  const formatDate = (dateString) => {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111] p-6 rounded-lg border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-[#5FD068]" />
            Gerenciamento da Galeria
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Adicione ou remova imagens da galeria.
          </p>
        </div>
        
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="bg-[#5FD068] text-black hover:bg-[#4ab553]"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Enviando...' : 'Nova Imagem'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#5FD068]" />
            <p>Carregando imagens...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg">Galeria vazia</p>
            <Button 
              variant="link" 
              onClick={() => fileInputRef.current?.click()}
              className="text-[#5FD068]"
            >
              Adicione a primeira imagem
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-xs font-bold text-slate-400 uppercase border-b border-white/5">
                <tr>
                  <th className="p-4 w-[100px]">Preview</th>
                  <th className="p-4">Nome do Arquivo</th>
                  <th className="p-4 w-[200px]">Data de Envio</th>
                  <th className="p-4 w-[100px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-12 rounded overflow-hidden bg-black/50 border border-white/10">
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-white">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="truncate max-w-[200px] md:max-w-[300px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-600" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryAdmin;