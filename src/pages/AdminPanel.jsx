import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users, 
  FileText, 
  BarChart, 
  Clock, 
  ShieldAlert, 
  Download, 
  Shield, 
  Loader2, 
  FileInput,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/supabase';

// Replaced Next.js dynamic imports with React.lazy for Vite compatibility
const RegulationManagement = React.lazy(() => import('@/components/RegulationManagement'));
const RSOApproval = React.lazy(() => import('@/components/RSOApproval'));
const BatePontoApproval = React.lazy(() => import('@/components/BatePontoApproval'));
const UserAccessControl = React.lazy(() => import('@/components/UserAccessControl'));
const ShiftHistory = React.lazy(() => import('@/components/ShiftHistory'));
const UserDeletionPanel = React.lazy(() => import('@/components/UserDeletionPanel'));
const ExportDataPanel = React.lazy(() => import('@/components/ExportDataPanel'));
const HierarchyManagement = React.lazy(() => import('@/components/HierarchyManagement'));
const TransferEdictAdmin = React.lazy(() => import('@/components/TransferEdictAdmin'));
const GalleryAdmin = React.lazy(() => import('@/components/GalleryAdmin'));

const AdminPanel = () => {
  const { hasRole, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('hierarchy');
  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  if (!hasRole(['Administrativos', 'Super Administrativo'])) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
        <p className="text-[#a8a9ad]">Esta área é restrita ao comando do batalhão.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'hierarchy': return <HierarchyManagement />;
      case 'dashboard':
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            <RSOApproval />
            <BatePontoApproval />
          </div>
        );
      case 'shift_history': return <ShiftHistory />;
      case 'users': return <UserAccessControl />;
      case 'regulations': return <RegulationManagement />;
      case 'transfer_edicts': return <TransferEdictAdmin />;
      case 'gallery': return <GalleryAdmin />;
      case 'export': return <ExportDataPanel />;
      case 'super_admin_users': return isSuperAdmin ? <UserDeletionPanel /> : null;
      default: return null;
    }
  };

  const TabButton = ({ id, label, icon: Icon, activeClass = "bg-[#5FD068] text-black", inactiveClass = "text-[#a8a9ad] hover:text-white border-[#a8a9ad]/30" }) => (
    <Button
      variant={activeTab === id ? 'default' : 'outline'}
      onClick={() => setActiveTab(id)}
      className={activeTab === id ? activeClass : inactiveClass}
    >
      <Icon className="w-4 h-4 mr-2" /> {label}
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-[#5FD068]" />
        <h1 className="text-3xl font-bold text-white">Painel de Comando</h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#a8a9ad]/20 pb-4">
        <TabButton id="hierarchy" label="Gestão de Efetivo" icon={Shield} />
        <TabButton id="dashboard" label="Aprovações" icon={BarChart} />
        <TabButton id="shift_history" label="Histórico" icon={Clock} />
        <TabButton id="users" label="Acessos" icon={Users} />
        <TabButton id="transfer_edicts" label="Editais" icon={FileInput} />
        <TabButton id="gallery" label="Galeria" icon={ImageIcon} />
        <TabButton id="regulations" label="Regulamentos" icon={FileText} />
        <TabButton id="export" label="Exportar" icon={Download} />

        {isSuperAdmin && (
          <Button
            variant={activeTab === 'super_admin_users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('super_admin_users')}
            className={activeTab === 'super_admin_users' ? 'bg-red-600 text-white border-red-500' : 'text-red-400 hover:text-red-200 border-red-900/30 hover:bg-red-900/20'}
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> Deletar Usuários
          </Button>
        )}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-[400px]"
      >
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[#5FD068] animate-spin" />
          </div>
        }>
          {renderContent()}
        </Suspense>
      </motion.div>
    </div>
  );
};
export default AdminPanel;