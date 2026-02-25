import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
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

const UserDeletionPanel = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar usuários', variant: 'destructive' });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    
    if (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao deletar usuário. Verifique permissões.', variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso', description: 'Usuário deletado permanentemente.' });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4 p-4 bg-red-900/10 border border-red-500/20 rounded-lg">
         <UserX className="w-6 h-6 text-red-500" />
         <div>
            <h3 className="text-xl font-bold text-red-500">Zona de Perigo: Gerenciamento de Usuários (Super Admin)</h3>
            <p className="text-xs text-red-400">Ações nesta área são irreversíveis.</p>
         </div>
       </div>
       
       <div className="bg-[#1a1a1a] rounded-xl border border-red-900/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-red-950/30 border-b border-red-900/20">
                <tr>
                  <th className="p-4 text-sm font-medium text-red-200">ID</th>
                  <th className="p-4 text-sm font-medium text-red-200">Usuário</th>
                  <th className="p-4 text-sm font-medium text-red-200">Nome</th>
                  <th className="p-4 text-sm font-medium text-red-200">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-red-900/5">
                    <td className="p-4 text-xs text-[#a8a9ad] font-mono">{user.id}</td>
                    <td className="p-4 text-white font-mono">{user.username}</td>
                    <td className="p-4 text-white">{user.full_name}</td>
                    <td className="p-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="bg-red-900/50 hover:bg-red-600 border border-red-500/30">
                             <Trash2 className="w-4 h-4 mr-2" /> Deletar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1a1a1a] border border-red-500/30 text-white">
                          <AlertDialogHeader>
                            <div className="flex items-center gap-2 text-red-500 mb-2">
                                <AlertTriangle className="w-6 h-6" />
                                <AlertDialogTitle>Confirmação de Exclusão</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-[#a8a9ad]">
                              Tem certeza que deseja deletar o usuário <span className="text-white font-bold">{user.username}</span>? 
                              <br/><br/>
                              <span className="text-red-400 font-bold">Esta ação não pode ser desfeita.</span> O usuário perderá todo o acesso e seus dados poderão ser perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border border-[#a8a9ad]/20 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(user.id)} className="bg-red-600 hover:bg-red-700 text-white border-none">
                                Sim, Deletar Usuário
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
};

export default UserDeletionPanel;