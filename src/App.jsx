import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import MainLayout from '@/components/MainLayout';
import HomePage from '@/pages/HomePage';

// Pages
import AboutUs from '@/pages/AboutUs';
import RSO from '@/pages/RSO';
import OperationalCheckIn from '@/pages/OperationalCheckIn';
import StageEvaluation from '@/pages/StageEvaluation';
import Regulations from '@/pages/Regulations';
import Hierarchy from '@/pages/Hierarchy';
import AdminPanel from '@/pages/AdminPanel';
import TransferEdict from '@/pages/TransferEdict';
import RankingsPage from '@/pages/RankingsPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home'); 
  const [isLoginPage, setIsLoginPage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#5FD068] text-xl font-bold animate-pulse">Carregando Sistema...</div>
      </div>
    );
  }

  // Public/Login Handling
  if (!isAuthenticated) {
    if (isLoginPage) {
      return <LoginPage />;
    }
    
    // Public Access Routes
    switch (activeTab) {
      case 'regulations':
        return <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}><Regulations /></MainLayout>;
      case 'hierarchy':
        return <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}><Hierarchy /></MainLayout>;
      case 'about':
        return <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}><AboutUs /></MainLayout>;
      case 'transfer':
        return <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}><TransferEdict /></MainLayout>;
      default:
        // Default to Home, passing navigation to allow jumping to other public tabs
        return <HomePage onNavigate={setActiveTab} onLogin={() => setIsLoginPage(true)} />;
    }
  }

  // Authenticated Routes
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} onLogin={() => {}} />; 
      case 'about':
        return <AboutUs />;
      case 'rso':
        return <RSO />;
      case 'checkin':
        return <OperationalCheckIn />;
      case 'evaluation':
        return <StageEvaluation />;
      case 'regulations':
        return <Regulations />;
      case 'hierarchy':
        return <Hierarchy />;
      case 'admin':
        return <AdminPanel />;
      case 'transfer':
        return <TransferEdict />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

function App() {
  return (
    <>
      <Helmet>
        <title>4° BPCHQ COE - Batalhão de Polícia de Choque</title>
        <meta name="description" content="4° Batalhão de Polícia de Choque - Comandos e Operações Especiais." />
        <meta name="theme-color" content="#5FD068" />
      </Helmet>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default App;