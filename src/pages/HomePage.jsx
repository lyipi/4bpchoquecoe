import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TopNavigation from '@/components/TopNavigation';
import StatisticsSection from '@/components/StatisticsSection';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FileInput } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const HomePage = ({ onNavigate, onLogin }) => {
  const emblemUrl = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/5c005e9eed1262ea6e1cc1d2ad72fde4.png";
  
  const { scrollY } = useScroll();
  const y2 = useTransform(scrollY, [0, 500], [0, -150]); 

  const [pageData, setPageData] = useState({
    heroTitle: '4° BPCHQ - COE',
    heroSubtitle: 'Comandos e Operações Especiais',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'home_content')
      .maybeSingle();
      
    if(data?.setting_value) setPageData(data.setting_value);
  };

  const heroTitleParts = pageData.heroTitle.split(' ');
  const firstPart = heroTitleParts.slice(0, heroTitleParts.length - 1).join(' '); 
  const lastPart = heroTitleParts[heroTitleParts.length - 1]; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-green-950 text-white font-sans selection:bg-[#5FD068] selection:text-black overflow-x-hidden">
      <TopNavigation onNavigate={onNavigate} onLoginClick={onLogin} />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
        
        <motion.div style={{ y: y2 }} className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center justify-center space-y-10">
           
           <motion.div
             className="relative z-20"
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ 
               opacity: 1, 
               scale: 1,
               y: [0, -15, 0] 
             }}
             transition={{
               opacity: { duration: 0.8, ease: "easeOut" },
               scale: { duration: 0.8, ease: "backOut" },
               y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
             }}
           >
             <motion.div
               className="absolute inset-0 rounded-full bg-[#5FD068] blur-[40px] z-0"
               animate={{ 
                 opacity: [0.2, 0.5, 0.2],
                 scale: [0.8, 1.2, 0.8]
               }}
               transition={{
                 duration: 3,
                 repeat: Infinity,
                 ease: "easeInOut"
               }}
             />
             
             <motion.img 
               src={emblemUrl}
               alt="Operações Especiais"
               className="relative z-10 w-[120px] md:w-[200px] object-contain cursor-pointer drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
               whileHover={{ 
                 scale: 1.1, 
                 rotate: 3,
                 filter: "brightness(1.2) drop-shadow(0 0 20px rgba(95, 208, 104, 0.6))",
               }}
               transition={{ type: "spring", stiffness: 300, damping: 15 }}
             />
           </motion.div>

           <div className="text-center space-y-4">
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.8 }}
               className="text-5xl md:text-7xl font-black uppercase drop-shadow-lg"
             >
               <span className="text-white">{firstPart} </span>
               <span className="text-[#5FD068] [text-shadow:_0_0_8px_var(--tw-shadow-color)] shadow-[#5FD068]">{lastPart}</span>
             </motion.h1>
             <motion.h2 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.8 }}
               className="text-xl md:text-3xl font-bold text-white tracking-widest uppercase text-opacity-90"
             >
               {pageData.heroSubtitle}
             </motion.h2>
           </div>

           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8 }}
           >
             <Button 
               onClick={() => onNavigate('transfer')} 
               className="bg-[#1a1a1a] hover:bg-[#5FD068] hover:text-black border border-[#5FD068]/30 text-white px-8 py-6 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(95,208,104,0.1)] hover:shadow-[0_0_25px_rgba(95,208,104,0.4)]"
             >
               <FileInput className="w-5 h-5 mr-2" /> ENTRE EM CONTATO
             </Button>
           </motion.div>
        </motion.div>
      </section>
      
      {/* Gallery Section - Now above Statistics */}
      <section className="relative py-24 px-4 bg-gradient-to-t from-black via-slate-950/30 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight"
            >
            <span className="text-[#5FD068]">CCOMSOC</span>
            </motion.h2>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="h-1 w-24 bg-[#5FD068] mx-auto rounded-full" 
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Gallery />
          </motion.div>
        </div>
      </section>

      {/* Statistics Section - Now below Gallery */}
      <StatisticsSection />
      
      <Footer />
    </div>
  );
};

export default HomePage;