import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import HierarchyEditModal from '@/components/HierarchyEditModal';
import HierarchyTableRow from '@/components/HierarchyTableRow';

/* =======================
   CATEGORIAS
======================= */
const RANK_CATEGORIES = [
  {
    id: 'superiores',
    title: 'Oficiais Superiores',
    ranks: ['Coronel', 'Tenente Coronel', 'Tenente-Coronel', 'Major']
  },
  {
    id: 'intermediarios',
    title: 'Oficiais Intermediários',
    ranks: ['Capitão']
  },
  {
    id: 'subalternos',
    title: 'Oficiais Subalternos',
    ranks: ['1º Tenente', '1° Tenente', '2º Tenente', '2° Tenente']
  },
  {
    id: 'especiais',
    title: 'Praças Especiais',
    ranks: ['Aspirante a Oficial', 'Aspirante-a-Oficial', 'Aluno Oficial']
  },
  {
    id: 'graduados',
    title: 'Praças Graduados',
    ranks: [
      'Sub Tenente', 'Subtenente',
      '1º Sargento', '1° Sargento',
      '2º Sargento', '2° Sargento',
      '3º Sargento', '3° Sargento',
      'Aluno a Sargento'
    ]
  },
  {
    id: 'pracas',
    title: 'Praças',
    ranks: [
      'Cabo',
      'Soldado',
      'Soldado 1ª Classe',
      'Soldado 2ª Classe',
      'Soldado 1 Classe',
      'Soldado 2 Classe',
      'Aluno Soldado'
    ]
  }
];

/* =======================
   ORDEM MILITAR
======================= */
const RANK_ORDER = {
  'Coronel': 1,
  'Tenente Coronel': 2,
  'Tenente-Coronel': 2,
  'Major': 3,
  'Capitão': 4,
  '1º Tenente': 5,
  '1° Tenente': 5,
  '2º Tenente': 6,
  '2° Tenente': 6,
  'Aspirante a Oficial': 7,
  'Aspirante-a-Oficial': 7,
  'Subtenente': 8,
  'Sub Tenente': 8,
  '1º Sargento': 9,
  '1° Sargento': 9,
  '2º Sargento': 10,
  '2° Sargento': 10,
  '3º Sargento': 11,
  '3° Sargento': 11,
  'Cabo': 12,
  'Soldado 1ª Classe': 13,
  'Soldado 2ª Classe': 14,
};

const sortByRank = (list) => {
  return [...list].sort((a, b) => {
    const rankA = RANK_ORDER[a.rank] ?? 999;
    const rankB = RANK_ORDER[b.rank] ?? 999;

    if (rankA !== rankB) return rankA - rankB;

    return (a.full_name || a.name).localeCompare(b.full_name || b.name);
  });
};

const Hierarchy = () => {
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

    const subscription = supabase
      .channel('hierarchy_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hierarchy' },
        fetchOfficers
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchOfficers = async () => {
    try {
      const { data, error } = await supabase.from('hierarchy').select('*');
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
    if (!window.confirm(`Excluir ${officer.full_name || officer.name}?`)) return;

    try {
      const { error } = await supabase
        .from('hierarchy')
        .delete()
        .eq('id', officer.id);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Militar removido.' });
      fetchOfficers();
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir.',
        variant: 'destructive'
      });
    }
  };

  const filteredOfficers = officers.filter(o =>
    (o.full_name || o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.serial || '').includes(searchTerm)
  );

  const groupedOfficers = RANK_CATEGORIES.map(category => ({
    ...category,
    officers: sortByRank(
      filteredOfficers.filter(o =>
        o.rank &&
        category.ranks.some(r => r.toLowerCase() === o.rank.toLowerCase())
      )
    )
  }));

  return (
    <div className="min-h-screen w-full bg-black space-y-10 px-2">
      {/* TOPO */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => (window.location.href = '/')}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <span className="text-sm text-slate-600">
          ATUALIZADO: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-slate-900 pb-6">
        <div className="flex gap-4">
          <Users className="w-12 h-12 text-green-600" />
          <div>
            <h1 className="text-4xl font-black text-white">HIERARQUIA</h1>
            <p className="text-slate-500">
              4BPCHOQUE - COE • Efetivo: {officers.length}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Pesquisar militar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-96"
          />

          {isAdmin && (
            <Button onClick={() => {
              setEditingOfficer(null);
              setIsModalOpen(true);
            }}>
              <Plus className="mr-2" /> Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* TABELA ÚNICA - LARGURAS AJUSTADAS */}
      {loading ? (
        <div className="py-32 text-center text-slate-500">Carregando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] table-fixed border-collapse text-sm">
            <thead className="border-b border-slate-800">
              <tr className="uppercase text-xs tracking-wider text-slate-500 h-16">
                <th className="w-[90px] p-4 text-center">CPF</th>
                <th className="w-[90px] p-4 text-center">Serial</th>
                <th className="w-[200px] p-4 text-center">Nome</th>
                <th className="w-[180px] p-4 text-center">Discord</th>
                <th className="w-[90px] p-4 text-center">Patente</th>
                <th className="w-[200px] p-4 text-center">Graduação</th>
                <th className="w-[160px] p-4 text-center">Função</th>
                <th className="w-[120px] p-4 text-center">Promoção</th>
                <th className="w-[120px] p-4 text-center">Entrada</th>
                <th className="w-[70px] p-4 text-center">CDD</th>
                <th className="w-[70px] p-4 text-center">SAT-B</th>
                <th className="w-[70px] p-4 text-center">T.B</th>
                <th className="w-[70px] p-4 text-center">T.A</th>
                <th className="w-[70px] p-4 text-center">MOD</th>
                <th className="w-[70px] p-4 text-center">POP</th>
                <th className="w-[70px] p-4 text-center">ABORD</th>
                <th className="w-[110px] p-4 text-center">Láurea</th>
                <th className="w-[310px] p-4 text-center">Cursos</th>
                {/* REMOVED ACTIONS COLUMN HEADER */}
              </tr>
            </thead>

            {groupedOfficers.map(category =>
              category.officers.length > 0 && (
                <tbody key={category.id}>
                  <tr>
                    <td colSpan={18} className="px-4 py-4 text-green-600 font-black text-xl bg-black">
                      {category.title}
                    </td>
                  </tr>

                  {category.officers.map((officer, idx) => (
                    <HierarchyTableRow
                      key={officer.id}
                      officer={officer}
                      isAdmin={isAdmin}
                      isEven={idx % 2 === 0}
                      showActions={false}
                      onEdit={o => {
                        setEditingOfficer(o);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              )
            )}
          </table>
        </div>
      )}

      <HierarchyEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        officerToEdit={editingOfficer}
        onSave={fetchOfficers}
      />
    </div>
  );
};

export default Hierarchy;