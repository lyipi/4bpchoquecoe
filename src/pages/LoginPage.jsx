import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.OPERATIONAL); // Default for login
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();
  const emblemUrl = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/b01183a6a5d394054c5044129d3bf382.png";

  const roles = [
    { value: ROLES.OPERATIONAL, label: 'Operacionais', color: 'from-green-600 to-green-800' },
    { value: ROLES.ADMINISTRATIVE, label: 'Administrativos', color: 'from-amber-600 to-amber-800' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Registration Logic
        if (!username || !password || !name) {
          toast({
            title: 'Campos obrigatórios',
            description: 'Por favor, preencha ID, Nome e Senha',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        const result = await register(name, username, password);
        
        if (!result.success) {
          toast({
            title: 'Erro ao registrar',
            description: result.error || 'Falha na comunicação com o servidor',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Registro realizado!',
            description: 'Bem-vindo ao batalhão. Você foi logado automaticamente.'
          });
        }
      } else {
        // Login Logic
        if (!username || !password) {
          toast({
            title: 'Campos obrigatórios',
            description: 'Por favor, preencha todos os campos',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        const result = await login(username, password);
        
        if (!result.success) {
          toast({
            title: 'Erro ao entrar',
            description: result.error || 'Credenciais inválidas ou erro de conexão',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Login realizado',
            description: 'Bem-vindo ao sistema do batalhão'
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setUsername('');
    setPassword('');
    setName('');
  };

  const handleBackToHome = () => {
    // Force a full reload to clear any auth-ish state and go to home
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative">
      <div className="absolute top-4 left-4 z-10">
         <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="border-[#a8a9ad]/30 bg-black/50 text-[#a8a9ad] hover:text-white hover:bg-[#1a4d2e]/30"
          >
           <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Home
         </Button>
      </div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-[#1a4d2e] to-black border border-[#a8a9ad]/20 rounded-xl shadow-2xl p-8 overflow-hidden">
          <div className="flex flex-col items-center mb-6">
            <motion.img 
              layoutId="emblem"
              src={emblemUrl}
              alt="Operações Especiais Emblem"
              className="w-20 h-20 md:w-24 md:h-24 object-contain mb-4 drop-shadow-2xl"
            />
            <motion.h1 layoutId="title" className="text-2xl font-bold text-white mb-1">
              {isRegistering ? 'REGISTRO DE OPERADOR' : '4° BPCHQ COE - LOGIN'}
            </motion.h1>
            <p className="text-[#a8a9ad] text-center text-sm">Gestão Militar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Removed Role Selector for Login as role is determined by backend */}
            
            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  key="name-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-[#a8a9ad] mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border border-[#a8a9ad]/30 rounded-lg text-white placeholder-[#a8a9ad]/50 focus:outline-none focus:border-[#5FD068] transition-colors"
                    placeholder="Ex: Sd João Silva"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-[#a8a9ad] mb-1">
                ID (In-game)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#a8a9ad]/30 rounded-lg text-white placeholder-[#a8a9ad]/50 focus:outline-none focus:border-[#5FD068] transition-colors"
                placeholder={isRegistering ? "Crie seu ID de login" : "Digite seu ID de jogo"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a8a9ad] mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-[#a8a9ad]/30 rounded-lg text-white placeholder-[#a8a9ad]/50 focus:outline-none focus:border-[#5FD068] transition-colors"
                placeholder="Digite sua senha"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-gradient-to-r from-[#1a4d2e] to-[#2d7a4a] hover:from-[#2d7a4a] hover:to-[#1a4d2e] text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : (
                <>
                  {isRegistering ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                  {isRegistering ? 'Registrar Conta' : 'Entrar no Sistema'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#a8a9ad]/10 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-[#a8a9ad] hover:text-[#5FD068] transition-colors underline decoration-dotted"
            >
              {isRegistering 
                ? 'Já possui uma conta? Clique aqui para entrar.' 
                : 'Não tem acesso? Clique aqui para se registrar.'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;