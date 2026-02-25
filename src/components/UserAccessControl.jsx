import React, { useState, useEffect } from 'react';
import { UserCog, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase, ROLES } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserAccessControl = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Realtime subscription for user list changes
    const channel = supabase
      .channel('users_list_updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for inserts, updates, and deletes
          schema: 'public',
          table: 'users'
        },
        () => {
          // When any user changes, refresh the full list to be safe and accurate
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    // Only set loading on initial fetch to avoid flickering during realtime updates
    if (users.length === 0) setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({ 
        title: 'Erro', 
        description: 'Não foi possível carregar a lista de usuários.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || ROLES.OPERATIONAL);
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);

    console.log(`Updating user ${selectedUser.id} (${selectedUser.username}) to role ${newRole}`);

    // Optimistic UI Update: Update local state immediately before server response
    const previousUsers = [...users];
    setUsers(currentUsers => 
      currentUsers.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u)
    );

    try {
      // 1. Update the role in Supabase
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', selectedUser.id)
        .select();
      
      console.log("Update response:", data);
      
      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      // 2. Show success message
      toast({ 
        title: 'Acesso atualizado com sucesso', 
        description: `O usuário ${selectedUser.username} agora é ${newRole}.`,
        className: "bg-[#1a4d2e] border-none text-white"
      });
      
      // 3. Confirm with fresh data
      await fetchUsers();
      
      // 4. Close modal
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Error updating role:', error);
      
      // Revert optimistic update on error
      setUsers(previousUsers);

      toast({ 
        title: 'Erro na atualização', 
        description: `Falha ao atualizar o cargo: ${error.message || 'Erro desconhecido'}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const canManageRole = (roleToCheck) => {
    // Only Super Admin can manage other Super Admins
    if (roleToCheck === ROLES.SUPER_ADMIN && currentUser.role !== ROLES.SUPER_ADMIN) {
      return false;
    }
    return true;
  };

  // Helper to determine badge color
  const getBadgeColor = (role) => {
    switch(role) {
      case ROLES.SUPER_ADMIN: return 'bg-purple-900/50 text-purple-200 border-purple-800';
      case ROLES.ADMINISTRATIVE: return 'bg-red-900/50 text-red-200 border-red-800';
      default: return 'bg-green-900/50 text-green-200 border-green-800';
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4">
         <UserCog className="w-6 h-6 text-[#5FD068]" />
         <h3 className="text-xl font-bold text-white">Controle de Acesso de Usuários</h3>
       </div>
       
       <div className="bg-[#1a1a1a] rounded-xl border border-[#a8a9ad]/20 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/50 border-b border-[#a8a9ad]/20">
                <tr>
                  <th className="p-4 text-sm font-medium text-[#a8a9ad]">Usuário</th>
                  <th className="p-4 text-sm font-medium text-[#a8a9ad]">Nome Completo</th>
                  <th className="p-4 text-sm font-medium text-[#a8a9ad]">Permissão Atual</th>
                  <th className="p-4 text-sm font-medium text-[#a8a9ad]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#a8a9ad]/10">
                {loading && users.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-[#a8a9ad]">Carregando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-[#a8a9ad]">Nenhum usuário encontrado.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-mono text-sm">{user.username}</td>
                      <td className="p-4 text-white text-sm">{user.full_name}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded border font-medium ${getBadgeColor(user.role)}`}>
                          {user.role || ROLES.OPERATIONAL}
                        </span>
                      </td>
                      <td className="p-4">
                        {canManageRole(user.role) && user.id !== currentUser.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditClick(user)}
                            className="border-[#5FD068]/30 hover:bg-[#5FD068] hover:text-black transition-colors"
                          >
                             <ShieldCheck className="w-4 h-4 mr-2" /> Gerenciar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
       </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="bg-[#1a1a1a] border border-[#a8a9ad]/20 text-white sm:max-w-[425px]">
           <DialogHeader>
             <DialogTitle>Alterar Permissão de Acesso</DialogTitle>
             <DialogDescription className="text-[#a8a9ad]">
               Selecione o novo nível de acesso para <span className="text-white font-bold">{selectedUser?.username}</span>.
             </DialogDescription>
           </DialogHeader>

           <div className="py-4 space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium text-[#a8a9ad]">Nível de Acesso</label>
               <Select value={newRole} onValueChange={setNewRole} disabled={isUpdating}>
                 <SelectTrigger className="w-full bg-black/50 border border-[#a8a9ad]/30 text-white focus:ring-[#5FD068]">
                   <SelectValue placeholder="Selecione um cargo" />
                 </SelectTrigger>
                 <SelectContent className="bg-[#1a1a1a] border-[#a8a9ad]/20 text-white">
                   <SelectItem value={ROLES.OPERATIONAL}>Operacionais</SelectItem>
                   <SelectItem value={ROLES.ADMINISTRATIVE}>Administrativos</SelectItem>
                   {currentUser.role === ROLES.SUPER_ADMIN && (
                     <SelectItem value={ROLES.SUPER_ADMIN}>Super Administrativo</SelectItem>
                   )}
                 </SelectContent>
               </Select>
             </div>
             
             <div className={`text-xs p-3 rounded border ${
               newRole === ROLES.OPERATIONAL ? 'bg-green-900/20 border-green-800/30 text-green-200' :
               newRole === ROLES.ADMINISTRATIVE ? 'bg-red-900/20 border-red-800/30 text-red-200' :
               'bg-purple-900/20 border-purple-800/30 text-purple-200'
             }`}>
               <p className="font-semibold mb-1">
                 {newRole === ROLES.OPERATIONAL && "Acesso Padrão"}
                 {newRole === ROLES.ADMINISTRATIVE && "Acesso de Comando"}
                 {newRole === ROLES.SUPER_ADMIN && "Acesso Total (Root)"}
               </p>
               <p className="opacity-80">
                 {newRole === ROLES.OPERATIONAL && "Usuário poderá registrar ponto, RSO e visualizar suas estatísticas."}
                 {newRole === ROLES.ADMINISTRATIVE && "Permite gerenciar usuários (exceto Super Admins), aprovar pontos e RSOs."}
                 {newRole === ROLES.SUPER_ADMIN && "Permissão irrestrita. Pode gerenciar todos os usuários e configurações do sistema."}
               </p>
             </div>
           </div>

           <DialogFooter>
             <Button 
               variant="outline" 
               onClick={() => setIsDialogOpen(false)}
               disabled={isUpdating}
               className="bg-transparent border-[#a8a9ad]/30 text-[#a8a9ad] hover:text-white hover:bg-white/10"
             >
               Cancelar
             </Button>
             <Button 
               onClick={handleSaveRole}
               disabled={isUpdating}
               className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black"
             >
               {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  );
};

export default UserAccessControl;