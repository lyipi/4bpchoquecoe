import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const ContentEditor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [homeData, setHomeData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: ''
  });

  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    history: '',
    heroImage: ''
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      // Fetch Home Data
      const { data: homeSettings, error: homeError } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'home_content')
        .maybeSingle();

      if (homeError) throw homeError;
      if (homeSettings?.setting_value) {
        setHomeData(homeSettings.setting_value);
      }

      // Fetch About Data
      const { data: aboutSettings, error: aboutError } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'about_content')
        .maybeSingle();

      if (aboutError) throw aboutError;
      if (aboutSettings?.setting_value) {
        setAboutData(aboutSettings.setting_value);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o conteúdo. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `site-assets/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('content-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('content-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageUpload = async (e, section) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const url = await uploadFile(file);
        if (section === 'home') {
          setHomeData(prev => ({ ...prev, heroImage: url }));
        } else {
          setAboutData(prev => ({ ...prev, heroImage: url }));
        }
        toast({ title: 'Imagem carregada com sucesso' });
      } catch (error) {
        console.error('Upload error:', error);
        toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    }
  };

  const saveHome = async () => {
    setIsSaving(true);
    try {
      // Task 1: Using upsert to handle both insert and update
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          setting_key: 'home_content', 
          setting_value: homeData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Conteúdo da Home atualizado.' });
    } catch (error) {
      console.error('Error saving home content:', error);
      toast({ title: 'Erro', description: 'Falha ao salvar alterações.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAbout = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ 
          setting_key: 'about_content', 
          setting_value: aboutData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Conteúdo do Sobre Nós atualizado.' });
    } catch (error) {
      console.error('Error saving about content:', error);
      toast({ title: 'Erro', description: 'Falha ao salvar alterações.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[#5FD068] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#5FD068]/20 space-y-6">
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <Button 
          variant={activeTab === 'home' ? 'default' : 'outline'}
          onClick={() => setActiveTab('home')}
          className={activeTab === 'home' ? 'bg-[#5FD068] text-black hover:bg-[#4ab853]' : 'text-[#a8a9ad] border-[#a8a9ad]/30'}
        >
          Editor Home
        </Button>
        <Button 
          variant={activeTab === 'about' ? 'default' : 'outline'}
          onClick={() => setActiveTab('about')}
          className={activeTab === 'about' ? 'bg-[#5FD068] text-black hover:bg-[#4ab853]' : 'text-[#a8a9ad] border-[#a8a9ad]/30'}
        >
          Editor Sobre Nós
        </Button>
      </div>

      {activeTab === 'home' ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Editar Página Inicial</h3>
          <div>
            <label className="text-xs text-[#a8a9ad]">Título Principal</label>
            <input 
              value={homeData.heroTitle}
              onChange={e => setHomeData({...homeData, heroTitle: e.target.value})}
              className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad]">Subtítulo</label>
            <input 
              value={homeData.heroSubtitle}
              onChange={e => setHomeData({...homeData, heroSubtitle: e.target.value})}
              className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad] mb-2 block">Imagem de Fundo (Hero)</label>
            <div className="relative h-40 bg-black rounded-lg overflow-hidden mb-2 border border-[#a8a9ad]/30 group">
               {homeData.heroImage && <img src={homeData.heroImage} alt="Hero" className="w-full h-full object-cover opacity-60" />}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('home-upload').click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    {uploading ? 'Enviando...' : 'Alterar Imagem'}
                  </Button>
               </div>
            </div>
            <input type="file" id="home-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'home')} />
          </div>
          <Button onClick={saveHome} disabled={isSaving || uploading} className="w-full bg-[#5FD068] text-black hover:bg-[#4ab853]">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações Home
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Editar Sobre Nós</h3>
          <div>
            <label className="text-xs text-[#a8a9ad]">Título da Seção</label>
            <input 
              value={aboutData.title}
              onChange={e => setAboutData({...aboutData, title: e.target.value})}
              className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad]">Descrição Curta</label>
            <textarea 
              value={aboutData.description}
              onChange={e => setAboutData({...aboutData, description: e.target.value})}
              className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white h-24"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad]">História Completa</label>
            <textarea 
              value={aboutData.history}
              onChange={e => setAboutData({...aboutData, history: e.target.value})}
              className="w-full bg-black border border-[#a8a9ad]/30 rounded p-2 text-white h-40"
            />
          </div>
          <div>
            <label className="text-xs text-[#a8a9ad] mb-2 block">Imagem de Destaque</label>
            <div className="relative h-40 bg-black rounded-lg overflow-hidden mb-2 border border-[#a8a9ad]/30 group">
               {aboutData.heroImage && <img src={aboutData.heroImage} alt="About Hero" className="w-full h-full object-cover opacity-60" />}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('about-upload').click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    {uploading ? 'Enviando...' : 'Alterar Imagem'}
                  </Button>
               </div>
            </div>
             <input type="file" id="about-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'about')} />
          </div>
          <Button onClick={saveAbout} disabled={isSaving || uploading} className="w-full bg-[#5FD068] text-black hover:bg-[#4ab853]">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações Sobre
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContentEditor;