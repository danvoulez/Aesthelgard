'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useNarrative } from '@/lib/narrative-context';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Maximize } from 'lucide-react';

// 3D Placeholder Component
function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4f46e5" wireframe />
    </mesh>
  );
}

export function MediaStage() {
  const { currentChapter } = useNarrative();
  const { media } = currentChapter;

  const renderMedia = () => {
    switch (media.type) {
      case 'video':
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
            <video
              src={media.url}
              className="w-full h-full object-cover max-w-sm mx-auto aspect-[9/16]"
              controlsList="nodownload"
              autoPlay
              muted
              loop
              playsInline
            />
            {/* Custom Overlay Controls Placeholder */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <button className="text-white hover:text-indigo-400 transition-colors"><Play size={20} /></button>
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
              </div>
              <button className="text-white hover:text-indigo-400 transition-colors"><Maximize size={20} /></button>
            </div>
          </div>
        );

      case '3d':
        return (
          <div className="w-full h-full bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-mono text-indigo-400 uppercase tracking-widest">
              Interactive Object
            </div>
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <SpinningCube />
            </Canvas>
          </div>
        );

      case 'document':
        return (
          <div className="w-full h-full bg-[#fdfbf7] dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-y-auto p-6 md:p-12">
            <div className="max-w-prose mx-auto">
              <h2 className="font-serif text-2xl md:text-4xl text-zinc-900 dark:text-zinc-100 mb-6 md:mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                {media.title}
              </h2>
              <div className="font-serif text-base md:text-lg leading-relaxed text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">
                {media.content}
              </div>
            </div>
          </div>
        );

      case 'image':
      default:
        return (
          <div className="relative w-full h-full rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden bg-zinc-950">
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${media.url})` }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-2xl font-medium text-white tracking-tight">{media.title}</h3>
              <p className="text-zinc-400 mt-2 text-sm max-w-md">{currentChapter.description}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 bg-zinc-100 dark:bg-zinc-950">
      <header className="flex-shrink-0 mb-3 md:mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xs md:text-sm font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Chapter {useNarrative().userState.currentChapterIndex + 1}
          </h2>
          <h1 className="text-xl md:text-2xl font-medium text-zinc-900 dark:text-zinc-100 mt-1">
            {currentChapter.title}
          </h1>
        </div>
      </header>
      
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {renderMedia()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
