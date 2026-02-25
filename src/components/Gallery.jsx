import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchImages();
    return () => stopAutoPlay();
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentIndex, isPaused, images.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    if (isPaused || images.length <= 1) return;
    
    autoPlayRef.current = setInterval(() => {
      paginate(1);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleInteraction = () => {
    setIsPaused(true);
    stopAutoPlay();
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 10000);
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from('gallery-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const galleryItems = data
        .filter(item => item.name !== '.emptyFolderPlaceholder')
        .map(item => {
          const { data: { publicUrl } } = supabase.storage
            .from('gallery-images')
            .getPublicUrl(item.name);
            
          return {
            id: item.id,
            url: publicUrl,
          };
        });

      setImages(galleryItems);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Não foi possível carregar as imagens da galeria.');
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const goToSlide = (index) => {
    handleInteraction();
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const onNext = () => {
    handleInteraction();
    paginate(1);
  };

  const onPrev = () => {
    handleInteraction();
    paginate(-1);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full bg-black/20 rounded-xl border border-white/5">
        <Loader2 className="w-8 h-8 text-[#5FD068] animate-spin mb-4" />
        <p className="text-white/50 text-sm">Carregando galeria...</p>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] w-full bg-black/20 rounded-xl border border-white/5 text-center px-4">
        {error ? (
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        ) : (
          <ImageIcon className="w-12 h-12 mb-4 opacity-50 text-white" />
        )}
        <p className="text-white/70">{error || 'Nenhuma imagem disponível.'}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Carousel Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl border border-white/10 group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex].url}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            alt={`Slide ${currentIndex + 1}`}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-[#5FD068] transition-all backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/5 hover:border-[#5FD068]/50"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/80 hover:text-[#5FD068] transition-all backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/5 hover:border-[#5FD068]/50"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center gap-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx === currentIndex 
                ? "w-8 bg-[#5FD068] shadow-[0_0_10px_rgba(95,208,104,0.5)]" 
                : "w-2 bg-white/20 hover:bg-white/40 hover:w-4"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Gallery;