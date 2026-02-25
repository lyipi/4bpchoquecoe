import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import BottomTabNavigation from './BottomTabNavigation';

const MainLayout = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const {
    currentUser,
    logout
  } = useAuth();
  const emblemUrl = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/b01183a6a5d394054c5044129d3bf382.png";

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#1a4d2e] to-black border-b border-[#a8a9ad]/20 backdrop-blur-lg shadow-lg">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.img 
                src={emblemUrl}
                alt="Operações Especiais Emblem"
                className="h-12 w-auto object-contain drop-shadow-md"
                whileHover={{ scale: 1.05 }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">4BPCHOQUE - COE</h1>
                <p className="text-xs text-[#a8a9ad]">{currentUser?.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{currentUser?.name}</p>
                <p className="text-xs text-[#a8a9ad]">{currentUser?.username}</p>
              </div>
              <Button onClick={logout} variant="outline" size="sm" className="bg-black/50 border-[#a8a9ad]/30 text-[#a8a9ad] hover:bg-red-900/30 hover:text-white hover:border-red-500/50 transition-all">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full width adaptation */}
      <main className="w-full mx-auto px-2 py-4 md:px-6 md:py-6">
        <motion.div key={activeTab} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default MainLayout;