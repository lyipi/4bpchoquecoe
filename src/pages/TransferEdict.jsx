import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileInput, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
const TransferEdict = () => {
  const {
    toast
  } = useToast();
  const {
    currentUser
  } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    rank: '',
    unit: '',
    phone: '',
    discordId: '',
    justification: '',
    declaration: false
  });
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.declaration) {
      toast({
        title: "Erro",
        description: "Aceite a declaração.",
        variant: "destructive"
      });
      return;
    }
    const {
      error
    } = await supabase.from('transfer_edict').insert({
      user_id: currentUser?.id,
      // nullable in DB so safe if not logged in
      full_name: formData.fullName,
      cpf: formData.cpf,
      rank: formData.rank,
      unit: formData.unit,
      phone: formData.phone,
      discord_id: formData.discordId,
      justification: formData.justification,
      declaration: formData.declaration,
      status: 'pending'
    });
    if (error) {
      toast({
        title: "Erro",
        description: error.message
      });
    } else {
      setSubmitted(true);
      toast({
        title: "Sucesso",
        description: "Edital enviado."
      });
    }
  };
  if (submitted) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <CheckCircle2 className="w-12 h-12 text-[#5FD068]" />
        <h2 className="text-3xl font-bold text-white">Edital Enviado!</h2>
        <Button onClick={() => window.location.href = '/'} className="bg-[#1a4d2e] text-white">Voltar para Home</Button>
      </div>;
  }
  return <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" onClick={() => window.location.href = '/'} className="p-0 mr-2 text-[#a8a9ad] hover:text-white"><ArrowLeft className="w-6 h-6" /></Button>
        <h1 className="text-3xl font-bold text-white">Entrar em contato</h1>
      </div>

      <motion.form initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <input required value={formData.fullName} onChange={e => setFormData({
          ...formData,
          fullName: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Nome Completo" />
          <input required value={formData.cpf} onChange={e => setFormData({
          ...formData,
          cpf: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="CPF" />
          <input required value={formData.rank} onChange={e => setFormData({
          ...formData,
          rank: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Patente" />
          <input required value={formData.unit} onChange={e => setFormData({
          ...formData,
          unit: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Unidade Atual" />
          <input required value={formData.phone} onChange={e => setFormData({
          ...formData,
          phone: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Telefone" />
          <input required value={formData.discordId} onChange={e => setFormData({
          ...formData,
          discordId: e.target.value
        })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Discord ID" />
        </div>
        <textarea required rows={5} value={formData.justification} onChange={e => setFormData({
        ...formData,
        justification: e.target.value
      })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Justificativa..." />
        <div className="flex items-start gap-4">
          <input type="checkbox" checked={formData.declaration} onChange={e => setFormData({
          ...formData,
          declaration: e.target.checked
        })} className="mt-1 w-4 h-4 accent-[#5FD068]" />
          <label className="text-sm text-[#a8a9ad]">Declaro que as informações prestadas são verdadeiras.</label>
        </div>
        <Button type="submit" className="w-full bg-[#5FD068] text-black font-bold h-12">Enviar Edital</Button>
      </motion.form>
    </div>;
};
export default TransferEdict;