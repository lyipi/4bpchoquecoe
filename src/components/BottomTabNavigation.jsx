import React from 'react';
import { motion } from 'framer-motion';
import { Info, FileText, Clock, ClipboardList, Settings, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/supabase';

const BottomTabNavigation = ({ activeTab, setActiveTab }) => {
  const { hasRole, isAuthenticated } = useAuth();

  const tabs = [
    { id: 'about', label: 'Sobre', icon: Info, public: true },
    { id: 'rankings', label: 'Rankings', icon: Trophy, roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE, ROLES.SUPER_ADMIN] },
    { id: 'rso', label: 'RSO', icon: FileText, roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE, ROLES.SUPER_ADMIN] },
    { id: 'checkin', label: 'Ponto', icon: Clock, roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE, ROLES.SUPER_ADMIN] },
    { id: 'evaluation', label: 'Avaliação', icon: ClipboardList, roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE, ROLES.SUPER_ADMIN] },
    { id: 'admin', label: 'Admin', icon: Settings, roles: [ROLES.ADMINISTRATIVE, ROLES.SUPER_ADMIN] }
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.public) return true;
    if (!isAuthenticated) return false;
    if (tab.roles) return hasRole(tab.roles);
    return true; 
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-[#a8a9ad]/20 backdrop-blur-lg z-50">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all min-w-[60px] ${
                  isActive
                    ? 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4a] text-white shadow-lg'
                    : 'text-[#a8a9ad] hover:bg-[#1a4d2e]/20'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-[#a8a9ad]'}`} />
                <span className="text-[10px] font-medium whitespace-nowrap">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabNavigation;