import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const EMBLEM_URL = "https://horizons-cdn.hostinger.com/49a93bbb-0c2b-4650-8b15-f695eaab0ba3/f14fc18476229a76d30bc2375a6291a2.png";

const VEHICLES = [
  { code: '94001', name: 'COMANDO COE', model: 'Comando' },
  { code: '94002', name: 'SUBCOMANDO COE', model: 'Sub-comando' },
  { code: '94003', name: 'COORDOP COE', model: 'Coordenação' },
  { code: '94100', name: 'COE 01/02/03', model: 'Comando de CIA' },
  { code: '94200', name: 'COE 04/05/06', model: 'Oficiais' },
  { code: '94106', name: 'COE 106', model: 'Trailblazer 21' },
  { code: '94109', name: 'COE 109', model: 'Trailblazer 21' },
  { code: '94206', name: 'COE 206', model: 'Trailblazer 23' },
  { code: '94215', name: 'COE 215', model: 'Trailblazer 23' },
  { code: '94308', name: 'COE 308', model: 'Trailblazer 22' },
];

const VehiclePrefixSelect = ({ value, onChange, disabled = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    if (disabled) return;
    // Mimic standard event object structure expected by parent components
    onChange({ target: { value: code } });
    setIsOpen(false);
  };

  const selectedVehicle = VEHICLES.find(v => v.code === value);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileHover={!disabled ? { scale: 1.005 } : {}}
        whileTap={!disabled ? { scale: 0.995 } : {}}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between
          bg-black border rounded-lg px-4 py-3
          transition-all duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed border-white/10' : 'cursor-pointer hover:border-[#5FD068]/70 hover:shadow-[0_0_15px_rgba(95,208,104,0.15)]'}
          ${isOpen ? 'border-[#5FD068] shadow-[0_0_20px_rgba(95,208,104,0.2)] bg-black/80' : 'border-[#5FD068]/30'}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 relative flex-shrink-0">
             <img src={EMBLEM_URL} alt="COE" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          
          <div className="flex flex-col items-start text-left overflow-hidden">
            {selectedVehicle ? (
              <>
                <span className="text-[#5FD068] font-bold text-sm tracking-wider leading-none mb-1 truncate w-full">
                  COE - {selectedVehicle.code}
                </span>
                <span className="text-white/60 text-xs font-medium truncate w-full">
                   {selectedVehicle.name} | {selectedVehicle.model}
                </span>
              </>
            ) : (
              <span className="text-[#a8a9ad] text-sm">Selecione a Viatura...</span>
            )}
          </div>
        </div>

        <ChevronDown 
          className={`w-5 h-5 text-[#5FD068] transition-transform duration-300 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 left-0"
          >
            <div className="bg-[#0a0a0a] border border-[#5FD068]/30 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#5FD068]/30 scrollbar-track-transparent">
              {VEHICLES.map((vehicle) => {
                const isSelected = vehicle.code === value;
                return (
                  <motion.button
                    key={vehicle.code}
                    type="button"
                    onClick={() => handleSelect(vehicle.code)}
                    className={`
                      w-full flex items-center justify-between p-3 border-b border-white/5 last:border-0
                      transition-all duration-200 group relative
                      ${isSelected ? 'bg-[#5FD068]/10' : 'hover:bg-white/5'}
                    `}
                    whileHover={{ x: 4 }}
                  >
                     {/* Left Highlight Bar */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? 'bg-[#5FD068]' : 'bg-transparent group-hover:bg-[#5FD068]/50'}`} />

                     <div className="flex items-center gap-3 pl-2 overflow-hidden">
                        <img src={EMBLEM_URL} alt="icon" className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <div className="flex flex-col items-start overflow-hidden">
                           <span className={`text-sm font-bold tracking-wide transition-colors truncate w-full text-left ${isSelected ? 'text-[#5FD068]' : 'text-white group-hover:text-[#5FD068]'}`}>
                             COE - {vehicle.code}
                           </span>
                           <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors text-left truncate w-full">
                             {vehicle.name} <span className="text-gray-700 mx-1">|</span> {vehicle.model}
                           </span>
                        </div>
                     </div>

                     {isSelected && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0 ml-2">
                         <Check className="w-4 h-4 text-[#5FD068]" />
                       </motion.div>
                     )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehiclePrefixSelect;