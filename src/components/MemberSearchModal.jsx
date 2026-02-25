import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const MemberSearchModal = ({ isOpen, onClose, onSelectMember, existingMemberIds = [] }) => {
  const { getAllUsers, hasRole } = useAuth();
  const isAdmin = hasRole(['Administrativos']);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const fetchedUsers = await getAllUsers();
          if (Array.isArray(fetchedUsers)) {
            setUsers(fetchedUsers);
          } else {
            setUsers([]);
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
          setUsers([]);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, getAllUsers]);

  if (!isOpen) return null;

  // Defensive check: ensure users is an array
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Filter users based on search and exclude already added members
  const filteredUsers = safeUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    // Handle different property names (full_name from DB vs name from session)
    const userName = user.full_name || user.name || '';
    
    const matchesSearch = 
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (userName && userName.toLowerCase().includes(searchLower)) ||
      (user.gameId && user.gameId.includes(searchLower)); 
      
    const isAlreadyAdded = existingMemberIds.includes(user.id);
    
    return matchesSearch && !isAlreadyAdded;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-[#5FD068]/30 rounded-xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#5FD068]" />
            Adicionar Membro
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID ou Nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#5FD068] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading ? (
             <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#5FD068] animate-spin" />
             </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-[#5FD068]/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a4d2e] flex items-center justify-center text-[#5FD068] font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.full_name || user.name || user.username}</p>
                    <div className="flex gap-2">
                       <p className="text-xs text-gray-400">ID: {user.username}</p>
                       {user.gameId && <p className="text-xs text-[#5FD068]">G-ID: {user.gameId}</p>}
                       {isAdmin && user.serial && <p className="text-xs text-red-400">Serial: {user.serial}</p>}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    // Normalize user object for the parent component
                    const normalizedUser = {
                        ...user,
                        name: user.full_name || user.name || user.username
                    };
                    onSelectMember(normalizedUser);
                    setSearchTerm(''); // Reset search
                  }}
                  className="bg-[#5FD068]/10 hover:bg-[#5FD068] text-[#5FD068] hover:text-black border border-[#5FD068]/50"
                >
                  Adicionar
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum usuário encontrado.' : 'Digite para buscar...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberSearchModal;