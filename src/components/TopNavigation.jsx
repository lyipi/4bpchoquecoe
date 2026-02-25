import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/supabase';

const TopNavigation = ({ onNavigate, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { hasRole, isAuthenticated } = useAuth();
  const emblemUrl = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/b01183a6a5d394054c5044129d3bf382.png";

  const allLinks = [
    { label: 'Início', href: 'home', public: true },
    { label: 'Sobre Nós', href: 'about', public: true },
    { label: 'Hierarquia', href: 'hierarchy', public: true },
    { label: 'Avaliação', href: 'evaluation', roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE] },
    { label: 'Regulamentos', href: 'regulations', public: true },
    { label: 'RSO', href: 'rso', roles: [ROLES.OPERATIONAL, ROLES.ADMINISTRATIVE] },
  ];

  const visibleLinks = allLinks.filter(link => {
    if (link.public) return true;
    if (!isAuthenticated) return false;
    if (link.roles) return hasRole(link.roles);
    return true;
  });

  const handleNav = (href) => {
    if (onNavigate) onNavigate(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#5FD068]/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNav('home')}>
            <motion.img 
              src={emblemUrl}
              alt="COE Emblem"
              className="h-10 w-auto md:h-12 object-contain"
              whileHover={{ scale: 1.05 }}
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white tracking-wider">
                4° BPCHQ <span className="text-[#5FD068]">COE</span>
              </h1>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className={`text-sm font-medium transition-colors relative group py-2 flex items-center gap-2 ${
                  link.icon ? 'text-[#5FD068] font-bold' : 'text-[#a8a9ad] hover:text-[#5FD068]'
                }`}
              >
                {link.icon && <ShieldAlert className="w-4 h-4" />}
                {link.label}
                {!link.icon && (
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#5FD068] transition-all duration-300 group-hover:w-full" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {!isAuthenticated && (
              <Button
                onClick={onLoginClick}
                className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black border border-[#5FD068]/30"
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#5FD068] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black border-b border-[#5FD068]/20 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {visibleLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.href)}
                  className="block w-full text-left text-lg font-medium text-[#a8a9ad] hover:text-[#5FD068] transition-colors pl-4 border-l-2 border-transparent hover:border-[#5FD068]"
                >
                  {link.label}
                </button>
              ))}
              {!isAuthenticated && (
                <div className="pt-4 border-t border-[#a8a9ad]/10">
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full bg-[#1a4d2e] text-white hover:bg-[#5FD068] hover:text-black"
                  >
                    Entrar no Sistema
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default TopNavigation;