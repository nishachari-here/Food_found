import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Quote } from 'lucide-react';

const storyContent = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad',
    title: 'The Soil',
    desc: 'Our farm in Ojai uses zero synthetic pesticides. We rely on ladybugs and natural compost.'
  },
  {
    type: 'quote',
    text: "We don't just grow food; we steward the land for the next seven generations.",
    author: "Farmer Sarah",
    url: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884'
  },
  {
    type: 'video_placeholder',
    url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2',
    title: 'Peak Freshness',
    desc: 'Picked at 5:00 AM, verified on the ledger by 6:00 AM.'
  }
];

const StoryMode = ({ isOpen, onClose }) => {
  const [current, setCurrent] = useState(0);

  // Auto-advance logic
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (current < storyContent.length - 1) setCurrent(current + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 md:p-4"
    >
      <div className="relative w-full max-w-md h-full md:h-[85vh] bg-slate-900 overflow-hidden md:rounded-3xl shadow-2xl">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
          {storyContent.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: i === current ? "100%" : i < current ? "100%" : "0%" }}
                transition={{ duration: i === current ? 5 : 0, ease: "linear" }}
                className="h-full bg-emerald-400"
              />
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-4 z-30 text-white p-2 bg-black/20 backdrop-blur-md rounded-full">
          <X size={20} />
        </button>

        {/* Content Layers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="absolute inset-0"
          >
            <img src={storyContent[current].url} className="w-full h-full object-cover" alt="Farm story" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-6 right-6 text-white">
              {storyContent[current].type === 'quote' ? (
                <div className="space-y-4">
                  <Quote className="text-emerald-400" size={32} />
                  <p className="text-xl italic font-medium leading-relaxed">"{storyContent[current].text}"</p>
                  <p className="text-emerald-400 font-bold tracking-widest uppercase text-xs">— {storyContent[current].author}</p>
                </div>
              ) : (
                <>
                  <h4 className="text-2xl font-bold mb-2">{storyContent[current].title}</h4>
                  <p className="text-slate-200 text-sm leading-relaxed">{storyContent[current].desc}</p>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Overlays */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={() => setCurrent(Math.max(0, current - 1))} />
          <div className="w-2/3 h-full cursor-pointer" onClick={() => setCurrent(Math.min(storyContent.length - 1, current + 1))} />
        </div>
      </div>
    </motion.div>
  );
};