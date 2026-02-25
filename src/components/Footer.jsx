import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, Instagram, Facebook, Twitter } from 'lucide-react';
const Footer = () => {
  const emblemUrl = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/b01183a6a5d394054c5044129d3bf382.png";
  return <footer className="bg-black border-t border-[#5FD068]/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          amount: 0.2
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="space-y-6">
            <div className="flex items-center gap-4">
              <motion.img src={emblemUrl} alt="Operações Especiais Emblem" className="h-14 w-auto object-contain" whileHover={{
              scale: 1.05,
              filter: "drop-shadow(0 0 8px rgba(95,208,104,0.4))"
            }} />
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wider">
                  4° BPCHQ <span className="text-[#5FD068]">- COE</span>
                </h2>
                <p className="text-[10px] text-[#a8a9ad] uppercase tracking-widest">Segurança e Proteção</p>
              </div>
            </div>
            <p className="text-[#a8a9ad] text-sm leading-relaxed">
              O 4° Batalhão de Polícia de Choque - Comandos e Operações Especiais é a unidade de elite responsável por missões de alta complexidade, garantindo a ordem e a segurança em situações críticas.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          amount: 0.2
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }}>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#5FD068] rounded-full" />
              Links Rápidos
            </h3>
            <ul className="space-y-4">
              {['Início', 'Hierarquia', 'Regulamentos'].map(link => <li key={link}>
                  <a href="#" className="text-[#a8a9ad] hover:text-[#5FD068] transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-[#1a4d2e] rounded-full group-hover:bg-[#5FD068] transition-colors" />
                    {link}
                  </a>
                </li>)}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          amount: 0.2
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }}>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#5FD068] rounded-full" />
              Contato
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-[#a8a9ad] text-sm group">
                <MapPin className="w-5 h-5 text-[#5FD068] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>Av. Santo Amaro/Av. Higienópolis - Brasil Capital - SP</span>
              </li>
              <li className="flex items-center gap-3 text-[#a8a9ad] text-sm group">
                <Phone className="w-5 h-5 text-[#5FD068] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>(11) 3311-0000</span>
              </li>
              <li className="flex items-center gap-3 text-[#a8a9ad] text-sm group">
                <Mail className="w-5 h-5 text-[#5FD068] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>brasilcapital@4bpchoque-coe.com.br</span>
              </li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          amount: 0.2
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }}>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#5FD068] rounded-full" />
              Redes Sociais
            </h3>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, idx) => <a key={idx} href="#" className="w-10 h-10 bg-[#1a4d2e]/20 border border-[#5FD068]/30 rounded-lg flex items-center justify-center text-[#5FD068] hover:bg-[#5FD068] hover:text-black hover:border-[#5FD068] transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </a>)}
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        amount: 0.2
      }} transition={{
        duration: 0.5,
        delay: 0.5
      }} className="border-t border-[#a8a9ad]/10 pt-8 mt-12 text-center">
          <div className="space-y-4">
            <p className="text-sm text-[#a8a9ad]">
              © {new Date().getFullYear()} 4° Batalhão de Polícia de Choque Comandos e Operações Especiais. Todos os direitos reservados.
            </p>
            <p className="text-xs text-[#a8a9ad] flex items-center justify-center gap-2">
              <span className="text-[#5FD068]">⚠️</span>
              Este é um portal fictício para uso no jogo Grand Theft Auto V no modo Role Play.
            </p>
            <p className="text-xs text-[#a8a9ad]">
              Desenvolvido por <a href="https://discord.gg/GP7FG97vQD" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#5FD068] hover:underline">Hariel Gz</a>
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6 text-xs text-[#a8a9ad]">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <span className="hidden md:inline-block text-[#a8a9ad]/50">•</span>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
          </div>
        </motion.div>
      </div>
    </footer>;
};
export default Footer;