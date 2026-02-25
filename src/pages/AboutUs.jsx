import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Award, Crosshair, Zap, Book, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadAboutPageData } from '@/lib/storage';

const AboutUs = () => {
  const [data, setData] = useState({
    title: 'Sobre o COE',
    description: '',
    history: '',
    heroImage: ''
  });

  // Override text content with Task 5 requirements
  const newHistoryText = "O Comandos e Operações Especiais (COE) é uma das unidades mais especializadas e respeitadas da Polícia Militar do Estado de São Paulo, subordinada ao Comando de Policiamento de Choque. Criado para atuar em ocorrências de altíssimo risco e complexidade, o COE reúne policiais altamente treinados em técnicas de operações especiais, combate em áreas de difícil acesso, resgate e missões que exigem preparo físico, psicológico e técnico acima da média. Sua origem está ligada à necessidade de a PMESP possuir uma tropa diferenciada capaz de responder a situações extremas, como ocorrências em áreas de mata, resgates em locais de difícil alcance, enfrentamento a criminosos fortemente armados e apoio em operações de grande porte. Ao longo de sua história, o COE consolidou-se como referência nacional em ações de operações especiais, mantendo sempre a disciplina, a coragem e a superação como valores fundamentais. Com tradição e excelência, a unidade representa o espírito de prontidão da Polícia Militar paulista, sendo sinônimo de eficiência e profissionalismo em defesa da sociedade.";
  
  // Updated hero image URL as requested
  const newHeroImage = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/e937e56ee77f3a4e6cbc0f22528d06c1.png";

  useEffect(() => {
    // We start with default valid data, and merge anything from storage if needed, but here we enforce the new requirements
    const loaded = loadAboutPageData() || {};
    setData({
      ...loaded,
      title: 'Sobre o COE',
      description: 'Comandos e Operações Especiais',
      history: newHistoryText,
      heroImage: newHeroImage
    });
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-2xl overflow-hidden h-[400px] border border-[#a8a9ad]/20 shadow-2xl bg-cover bg-center"
        style={{ backgroundImage: `url(${data.heroImage})` }}
      >
        {/* Remove the img tag and use background-image style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-[#5FD068]" />
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
              {data.title}
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl font-light drop-shadow-md">
            {data.description}
          </p>
        </div>
      </motion.div>

      {/* History */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Book className="w-8 h-8 text-[#5FD068]" />
            Nossa História
          </h2>
          <div className="space-y-4 text-[#a8a9ad] leading-relaxed whitespace-pre-line text-justify">
            {data.history}
          </div>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#5FD068]/20 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black text-[#5FD068] mb-2">1970</span>
            <span className="text-sm text-[#a8a9ad] uppercase tracking-widest">Ano de Criação</span>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#5FD068]/20 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-black text-[#5FD068] mb-2">4º</span>
            <span className="text-sm text-[#a8a9ad] uppercase tracking-widest">Batalhão de Choque</span>
          </div>
          <div className="col-span-2 bg-[#1a1a1a] p-6 rounded-xl border border-[#5FD068]/20 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-white mb-2">"No céu foram chamados de Deuses, no inferno de demônios e na terra de OPERAÇÕES ESPECIAIS!". </span>
            <span className="text-xs text-[#a8a9ad] uppercase tracking-widest">Lema</span>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <div className="grid md:grid-cols-3 gap-6">
        {[{
          icon: Target,
          title: 'Missão',
          text: 'Atuar em ocorrências de alta complexidade, garantindo a preservação da vida e a aplicação da lei em cenários extremos.'
        }, {
          icon: Crosshair,
          title: 'Visão',
          text: 'Ser a referência máxima em operações especiais policiais, mantendo a excelência técnica e operacional.'
        }, {
          icon: Zap,
          title: 'Valores',
          text: 'Disciplina, Hierarquia, Lealdade, Coragem, Honra e Comprometimento com a sociedade.'
        }].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-black p-8 rounded-xl border border-[#a8a9ad]/10 hover:border-[#5FD068]/50 transition-all shadow-lg"
          >
            <item.icon className="w-10 h-10 text-[#5FD068] mb-6" />
            <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
            <p className="text-[#a8a9ad] text-sm leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Return to Home Button */}
      <div className="flex justify-center pt-8 border-t border-[#a8a9ad]/10">
        <Button onClick={() => window.location.href = '/'} className="bg-[#1a4d2e] hover:bg-[#5FD068] text-white hover:text-black font-semibold transition-all px-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Home
        </Button>
      </div>
    </div>
  );
};

export default AboutUs;