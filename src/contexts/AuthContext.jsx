import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, ROLES } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Real-time role updates listener
  useEffect(() => {
    let channel;

    if (currentUser?.id) {
      // Create a specific channel for the current user's role updates
      channel = supabase
        .channel(`user_role_${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${currentUser.id}`,
          },
          (payload) => {
            console.log('Role update received:', payload);
            
            if (payload.new && payload.new.role !== currentUser.role) {
              const updatedUser = {
                ...currentUser,
                role: payload.new.role
              };
              
              setCurrentUser(updatedUser);
              localStorage.setItem('battalion_user_session', JSON.stringify(updatedUser));
              
              toast({
                title: "Permissões Atualizadas",
                description: `Seu nível de acesso foi alterado para: ${payload.new.role}`,
                variant: "default",
                className: "bg-[#5FD068] text-black border-none"
              });
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser?.id, currentUser?.role, toast]);

  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('battalion_user_session');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          
          // Verify/Refresh role from DB to ensure security on reload
          const freshProfile = await fetchUserProfile(userObj.id);
          
          if (freshProfile) {
             const userData = {
               id: freshProfile.id,
               username: freshProfile.username,
               role: freshProfile.role || ROLES.OPERATIONAL,
               name: freshProfile.full_name
             };
             setCurrentUser(userData);
             localStorage.setItem('battalion_user_session', JSON.stringify(userData));
          } else {
             // If user not found in DB, clear session
             localStorage.removeItem('battalion_user_session');
             setCurrentUser(null);
          }
        } catch (error) {
          console.error("Session restoration error", error);
          localStorage.removeItem('battalion_user_session');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (username, password) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { username, password }
      });

      if (error) {
        console.error("Auth function error:", error);
        throw new Error('Erro de conexão com servidor de autenticação.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      // Fetch full profile to get Role immediately upon login
      const userProfile = await fetchUserProfile(data.user.id);
      
      const userData = {
        id: data.user.id,
        username: data.user.username,
        role: userProfile?.role || ROLES.OPERATIONAL,
        name: data.user.full_name
      };
      
      setCurrentUser(userData);
      localStorage.setItem('battalion_user_session', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro ao conectar com servidor' };
    }
  };

  const register = async (name, username, password) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-register', {
        body: { username, password, full_name: name }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Auto-login logic
      const userData = {
        id: data.user_id,
        username: username,
        role: ROLES.OPERATIONAL, // Default role
        name: name
      };

      setCurrentUser(userData);
      localStorage.setItem('battalion_user_session', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Erro ao registrar' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('battalion_user_session');
  };

  const hasRole = (allowedRoles) => {
    if (!currentUser) return false;
    // Super Admin has access to everything
    if (currentUser.role === ROLES.SUPER_ADMIN) return true;
    return allowedRoles.includes(currentUser.role);
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      return [];
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    hasRole,
    getAllUsers, 
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};