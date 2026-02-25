import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Trash2, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import MemberSearchModal from '@/components/MemberSearchModal';
import VehiclePrefixSelect from '@/components/VehiclePrefixSelect';
const ROLES_CONFIG = [{
  key: 'encarregado',
  label: 'Encarregado',
  required: true
}, {
  key: 'motorista',
  label: 'Motorista',
  required: true
}, {
  key: 'terceiro_homem',
  label: '3º Homem',
  required: true
}, {
  key: 'quarto_homem',
  label: '4º Homem',
  required: false
}, {
  key: 'quinto_homem',
  label: '5º Homem',
  required: false
}];
const RSO = () => {
  const {
    currentUser
  } = useAuth();
  const {
    toast
  } = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitPrefix: '',
    occurrences: 0,
    drugs: 0,
    markedMoney: '',
    weapons: 0,
    bombs: 0,
    lockpicks: 0,
    detainees: 0,
    ammo: 0,
    // NEW FIELD
    actions: ''
  });
  const [activeMembers, setActiveMembers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlotKey, setCurrentSlotKey] = useState(null);
  useEffect(() => {
    fetchReports();
  }, [currentUser]);
  const fetchReports = async () => {
    if (!currentUser) return;
    const {
      data,
      error
    } = await supabase.from('rso').select('*').eq('user_id', currentUser.id).order('created_at', {
      ascending: false
    });
    if (data && Array.isArray(data)) {
      setReports(data);
    } else {
      setReports([]);
    }
  };
  const handleOpenModal = slotKey => {
    setCurrentSlotKey(slotKey);
    setIsModalOpen(true);
  };
  const handleSelectMember = member => {
    const isAlreadyAssigned = Object.values(activeMembers).some(m => m.id === member.id);
    if (isAlreadyAssigned) {
      toast({
        title: "Membro já adicionado",
        variant: "destructive"
      });
      return;
    }
    setActiveMembers(prev => ({
      ...prev,
      [currentSlotKey]: member
    }));
    setIsModalOpen(false);
  };
  const handleRemoveMember = slotKey => {
    const newMembers = {
      ...activeMembers
    };
    delete newMembers[slotKey];
    setActiveMembers(newMembers);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.unitPrefix) {
      toast({
        title: "Erro",
        description: "Prefixo da unidade é obrigatório",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    const missingRequired = ROLES_CONFIG.filter(r => r.required && !activeMembers[r.key]);
    if (missingRequired.length > 0) {
      toast({
        title: "Equipe Incompleta",
        description: `Faltam: ${missingRequired.map(r => r.label).join(', ')}`,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    const membersArray = Object.values(activeMembers).map(m => ({
      id: m.id,
      name: m.name,
      rank: m.rank,
      role: m.role || 'Membro'
    }));
    const newReport = {
      user_id: currentUser.id,
      unit_prefix: formData.unitPrefix,
      occurrences: formData.occurrences,
      drugs: formData.drugs,
      marked_money: formData.markedMoney,
      weapons: formData.weapons,
      bombs: formData.bombs,
      lockpicks: formData.lockpicks,
      detained: formData.detainees,
      ammo: formData.ammo,
      // NEW FIELD
      actions: formData.actions,
      members: membersArray,
      author: currentUser.full_name || currentUser.username,
      author_rank: currentUser.role,
      status: 'pending'
    };
    const {
      error
    } = await supabase.from('rso').insert(newReport);
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "RSO Salvo",
        description: "Relatório enviado e contabilizado para toda a equipe."
      });
      setFormData({
        unitPrefix: '',
        occurrences: 0,
        drugs: 0,
        markedMoney: '',
        weapons: 0,
        bombs: 0,
        lockpicks: 0,
        detainees: 0,
        ammo: 0,
        actions: ''
      });
      setActiveMembers({});
      fetchReports();
    }
    setIsLoading(false);
  };
  const handleDelete = async id => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      const {
        error
      } = await supabase.from('rso').delete().eq('id', id);
      if (!error) {
        toast({
          title: "Relatório excluído"
        });
        fetchReports();
      }
    }
  };
  const getExistingMemberIds = () => Object.values(activeMembers).map(m => m.id);
  return <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-[#5FD068]" />
        <h1 className="text-3xl font-bold text-white">Relatório de Serviço Operacional (RSO)</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Novo Relatório</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#5FD068] uppercase mb-2">Prefixo da Viatura</label>
              <VehiclePrefixSelect value={formData.unitPrefix} onChange={e => setFormData({
              ...formData,
              unitPrefix: e.target.value
            })} />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5FD068] uppercase mb-3">Guarnição</label>
              <div className="space-y-3">
                {ROLES_CONFIG.map(role => <div key={role.key} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                    <div>
                      <span className="text-xs text-gray-400 block">{role.label} {role.required && '*'}</span>
                      {activeMembers[role.key] ? <div className="flex flex-col">
                           <span className="text-white font-medium">{activeMembers[role.key].name}</span>
                           <span className="text-[10px] text-[#5FD068]">
                             {activeMembers[role.key].rank}
                           </span>
                        </div> : <span className="text-gray-600 italic text-sm">Não atribuído</span>}
                    </div>
                    {activeMembers[role.key] ? <button type="button" onClick={() => handleRemoveMember(role.key)} className="text-red-500 hover:bg-red-900/20 p-2 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button> : <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenModal(role.key)} className="text-[#5FD068] hover:text-[#5FD068] hover:bg-[#5FD068]/10">
                        <PlusCircle className="w-4 h-4" />
                      </Button>}
                  </div>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-xs text-gray-400">Ocorrências</label>
                  <input type="number" min="0" value={formData.occurrences} onChange={e => setFormData({
                ...formData,
                occurrences: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              <div>
                  <label className="text-xs text-gray-400">Detidos/Presos</label>
                  <input type="number" min="0" value={formData.detainees} onChange={e => setFormData({
                ...formData,
                detainees: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              <div>
                  <label className="text-xs text-gray-400">Bombas (Qtd)</label>
                  <input type="number" min="0" value={formData.bombs} onChange={e => setFormData({
                ...formData,
                bombs: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              <div>
                  <label className="text-xs text-gray-400">Lockpicks (Qtd)</label>
                  <input type="number" min="0" value={formData.lockpicks} onChange={e => setFormData({
                ...formData,
                lockpicks: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" />
              </div>
              <div>
                  <label className="text-xs text-gray-400">Munição (Qtd)</label>
                  <input type="number" min="0" value={formData.ammo} onChange={e => setFormData({
                ...formData,
                ammo: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="Ex: 100" />
              </div>
              <div>
                  <label className="text-xs text-gray-400">Armas (Qtd)</label>
                  <input type="number" min="0" value={formData.weapons} onChange={e => setFormData({
                ...formData,
                weapons: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="Ex: 5" />
              </div>
              <div className="col-span-2">
                  <label className="text-xs text-gray-400">Drogas Apreendidas (Qtd Total)</label>
                  <input type="number" min="0" value={formData.drugs} onChange={e => setFormData({
                ...formData,
                drugs: parseInt(e.target.value) || 0
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="Ex: 500" />
              </div>
              <div className="col-span-2">
                  <label className="text-xs text-gray-400">Dinheiro Marcado (R$)</label>
                  <input type="text" value={formData.markedMoney} onChange={e => setFormData({
                ...formData,
                markedMoney: e.target.value
              })} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="0,00" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5FD068] uppercase mb-2">Ações Realizadas</label>
              <textarea rows={4} value={formData.actions} onChange={e => setFormData({
              ...formData,
              actions: e.target.value
            })} className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:border-[#5FD068]" />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-[#5FD068] hover:bg-[#4ab854] text-black font-bold py-6 text-lg">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Salvar RSO</>}
            </Button>
          </form>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-6">Relatórios Salvos</h2>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {reports.map(report => <motion.div key={report.id} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-[#5FD068]/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#5FD068]">{report.unit_prefix}</h3>
                    <p className="text-xs text-gray-400">{new Date(report.created_at).toLocaleString()}</p>
                    <p className={`text-[10px] mt-1 uppercase font-bold px-2 py-0.5 rounded w-fit ${report.status === 'approved' ? 'bg-green-900 text-green-200' : report.status === 'rejected' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}`}>
                        {report.status}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(report.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4 bg-black/30 p-3 rounded">
                  <p><span className="text-gray-500">Ocorrências:</span> {report.occurrences}</p>
                  <p><span className="text-gray-500">Detidos:</span> {report.detained}</p>
                  <p><span className="text-gray-500">Drogas:</span> {report.drugs}</p>
                  <p><span className="text-gray-500">Armas:</span> {report.weapons}</p>
                  <p><span className="text-gray-500">Munição:</span> {report.ammo || 0}</p>
                </div>
                <div className="text-xs text-gray-500">
                  <p className="line-clamp-2">{report.actions}</p>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>

      <MemberSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectMember={handleSelectMember} existingMemberIds={getExistingMemberIds()} />
    </div>;
};
export default RSO;