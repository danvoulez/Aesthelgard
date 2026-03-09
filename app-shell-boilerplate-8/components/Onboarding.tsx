'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNarrative } from '@/lib/narrative-context';

export function Onboarding() {
  const { completeOnboarding } = useNarrative();
  const [view, setView] = useState<'landing' | 'loading' | 'genesis' | 'details'>('landing');
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [selectedWorldType, setSelectedWorldType] = useState<string | null>(null);

  const loadingTexts = [
    "Calibrating Physics...",
    "Establishing Timelines...",
    "Waking the Gatekeeper...",
    "Synthesizing Lore..."
  ];

  const handleInitialize = () => {
    setView('loading');
    
    // Cycle through loading texts
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 800);

    // Transition to Genesis after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      setView('genesis');
    }, 3200);
  };

  const handleSelectWorld = (type: string) => {
    setSelectedWorldType(type);
    setView('details');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 text-zinc-100 overflow-hidden font-sans">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 object-cover w-full h-full z-[-2]"
        src="/assets/bg-video.mp4"
      />
      
      {/* Dynamic Overlay */}
      <motion.div 
        className="absolute inset-0 z-[-1] pointer-events-none"
        animate={{
          backgroundColor: view === 'landing' ? 'rgba(10, 10, 10, 0.4)' : 'rgba(10, 10, 10, 0.85)',
          backdropFilter: view === 'landing' ? 'blur(0px)' : 'blur(16px)',
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </motion.div>

      <AnimatePresence mode="wait">
        {/* VIEW 1: The Cinematic Hook */}
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1 }}
            className="flex flex-col items-center justify-center"
          >
            <motion.button
              onClick={handleInitialize}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(255,255,255,0.8)" }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-full text-sm tracking-[0.2em] uppercase font-medium text-white overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-white/10"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative z-10">Initialize Universe</span>
            </motion.button>
          </motion.div>
        )}

        {/* VIEW 2: The Artistic Loading Screen */}
        {view === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            {/* Geometric Spinner */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 border-[1px] border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-2 border-[1px] border-t-white/80 border-r-transparent border-b-white/20 border-l-transparent rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-6 border-[1px] border-white/40 rounded-full"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Thematic Text */}
            <div className="h-8 relative flex items-center justify-center w-64">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute text-sm tracking-widest text-white/70 uppercase font-mono"
                >
                  {loadingTexts[loadingTextIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Dynamic Onboarding (Genesis) */}
        {view === 'genesis' && (
          <motion.div
            key="genesis"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="flex flex-col items-center justify-center w-full max-w-5xl px-6"
          >
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-heading font-light mb-16 tracking-wide text-white/90"
            >
              What are we building today?
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                { id: 'fantasy', icon: '🪐', title: 'A Fantastic Universe', desc: 'For authors & game designers' },
                { id: 'screenplay', icon: '🎬', title: 'A Grounded Screenplay', desc: 'For directors & writers' },
                { id: 'brand', icon: '🏢', title: 'A Brand Universe', desc: 'For agencies & strategists' }
              ].map((card, i) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleSelectWorld(card.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                  whileHover={{ 
                    scale: 1.03, 
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.3)",
                    boxShadow: "0 0 30px rgba(255,255,255,0.05)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center text-center p-10 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all group"
                >
                  <span className="text-5xl mb-6 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{card.icon}</span>
                  <h3 className="text-xl font-medium mb-2 text-white/90">{card.title}</h3>
                  <p className="text-sm text-white/50">{card.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: Details / Tone Selection */}
        {view === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center w-full max-w-2xl px-6"
          >
            <h2 className="text-3xl font-heading font-light mb-12 tracking-wide text-white/90">
              Establish the Tone
            </h2>

            <div className="grid grid-cols-2 gap-4 w-full mb-12">
              {['Grimdark', 'High Fantasy', 'Cyberpunk', 'Ethereal', 'Historical', 'Surreal'].map((tone, i) => (
                <motion.button
                  key={tone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-4 px-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all text-sm tracking-wider uppercase"
                >
                  {tone}
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => completeOnboarding()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-white text-neutral-950 rounded-full text-sm tracking-[0.1em] uppercase font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Generate Cartridge
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
