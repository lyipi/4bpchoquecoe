import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import HierarchyEditModal from '@/components/HierarchyEditModal';
import HierarchyTableRow from '@/components/HierarchyTableRow';

const RANK_CATEGORIES = [{
  id: 'superiores',
  title: 'Oficiais Superiores',
  ranks: ['Coronel', 'Tenente Coronel', 'Tenente-Coronel', 'Major']
}, {
  id: 'intermediarios',
  title: 'Oficiais Intermediários',
  ranks: ['Capitão']
}, {
  id: 'subalternos',
  title: 'Oficiais Subalternos',
  ranks: ['1º Tenente', '2º Tenente', '1° Tenente', '2° Tenente']
}, {
  id: 'especiais',
  title: 'Praças Especiais',
  ranks: ['Aspirante a Oficial', 'Aspirante-a-Oficial', 'Aluno Oficial']
}, {
  id: 'graduados',
  title: 'Praças Graduados',
  ranks: ['Sub Tenente', 'Subtenente', '1º Sargento', '2º Sargento', '3º Sargento', 'Aluno a Sargento']
}, {
  id: 'pracas',
  title: 'Praças',
  ranks: ['Cabo', 'Soldado', 'Soldado 1ª Classe', 'Soldado 2ª Classe', 'Soldado 1 Classe', 'Soldado 2 Classe', 'Aluno Soldado']
}];

const HierarchyManagement = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['Administrativos', 'Super Administrativo']);
  const { toast } = useToast();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase.from('hierarchy').select('*').order('name');
      if (error) throw error;
      setOfficers(data || []);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o efetivo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (officer) => {
    console.log('Attempting to delete officer:', officer);
    if (!officer?.id) {
        console.error('No officer ID found');
        return;
    }

    if (window.confirm(`Tem certeza que deseja excluir ${officer.full_name || officer.name}? Esta ação não pode ser desfeita.`)) {
      try {
        console.log('Sending delete request to Supabase for ID:', officer.id);
        const { error } = await supabase.from('hierarchy').delete().eq('id', officer.id);
        
        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        console.log('Officer deleted successfully');
        toast({ title: "Sucesso", description: "Militar removido do efetivo." });
        
        // Refresh the list immediately
        await fetchOfficers();
      } catch (error) {
        console.error('Delete operation caught error:', error);
        toast({ title: "Erro", description: "Não foi possível excluir o militar. " + (error.message || ''), variant: "destructive" });
      }
    } else {
        console.log('Deletion cancelled by user');
    }
  };

  const filteredOfficers = officers.filter(o => (o.full_name || o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (o.serial || '').includes(searchTerm));
  
  const groupedOfficers = RANK_CATEGORIES.map(category => {
    const list = filteredOfficers.filter(o => o.rank && category.ranks.some(r => r.toLowerCase() === o.rank.toLowerCase()));
    list.sort((a, b) => (a.full_name || a.name).localeCompare(b.full_name || b.name));
    return {
      ...category,
      officers: list
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-[#111] p-6 rounded-lg border border-white/5">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
           <Users className="w-6 h-6 text-[#5FD068]" /> Gestão de Efetivo
        </h2>
        <div className="flex gap-4">
           <Input 
             placeholder="Filtrar por nome ou serial..." 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             className="w-64 bg-black/50 border-white/10"
           />
           <Button onClick={() => {
              setEditingOfficer(null);
              setIsModalOpen(true);
           }} className="bg-[#5FD068] text-black hover:bg-[#4ab854] font-bold">
             <Plus className="w-4 h-4 mr-2" /> Adicionar
           </Button>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-gray-500 py-12">Carregando...</p>
        ) : (
          groupedOfficers.map(category => category.officers.length > 0 && (
            <div key={category.id} className="space-y-4">
              <h3 className="text-lg font-bold text-[#5FD068] uppercase pl-4 border-l-4 border-[#5FD068]">
                  {category.title}
              </h3>
              
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[1200px]">
                    <thead className="bg-black/40 text-xs font-bold text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">CPF</th>
                        <th className="p-3">Serial</th>
                        <th className="p-3">Nome</th>
                        <th className="p-3">Discord</th>
                        <th className="p-3 text-center">Patente</th>
                        <th className="p-3 text-center">Graduação</th>
                        <th className="p-3 text-center">Função</th>
                        <th className="p-3 text-center">Promoção</th>
                        <th className="p-3 text-center">Entrada</th>
                        <th className="p-2 text-center">CDD</th>
                        <th className="p-2 text-center">SAT-B</th>
                        <th className="p-2 text-center">T.B</th>
                        <th className="p-2 text-center">T.A</th>
                        <th className="p-2 text-center">MOD</th>
                        <th className="p-2 text-center">POP</th>
                        <th className="p-2 text-center">ABORD</th>
                        <th className="p-3 text-center">LAUREA</th>
                        <th className="p-3 text-center">Cursos</th>
                        <th className="p-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {category.officers.map((officer, idx) => (
                        <HierarchyTableRow 
                          key={officer.id} 
                          officer={officer} 
                          isAdmin={isAdmin} 
                          isEven={idx % 2 === 0} 
                          showActions={true}
                          onEdit={o => {
                            setEditingOfficer(o);
                            setIsModalOpen(true);
                          }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <HierarchyEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} officerToEdit={editingOfficer} onSave={fetchOfficers} />
    </div>
  );
};

export default HierarchyManagement;