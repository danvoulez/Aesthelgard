'use client';

import React, { useState } from 'react';
import { Product } from '@/schemas/canon';
import { motion } from 'motion/react';
import { Eye, EyeOff, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export function ProductCard({ product, onBuy }: ProductCardProps) {
  const [showRealWorld, setShowRealWorld] = useState(false);

  return (
    <div className="group relative flex flex-col bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl hover:border-indigo-500/50 transition-colors duration-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-indigo-400">
          {product.type.replace('_', ' ')}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg md:text-xl font-serif text-zinc-100">{product.name}</h3>
          <span className="text-base md:text-lg font-mono text-indigo-400">${product.price.toFixed(2)}</span>
        </div>

        {/* Description Toggle */}
        <div className="relative flex-1 mb-6">
          <motion.div
            initial={false}
            animate={{ opacity: showRealWorld ? 0 : 1 }}
            className="absolute inset-0 text-sm text-zinc-400 leading-relaxed"
            style={{ pointerEvents: showRealWorld ? 'none' : 'auto' }}
          >
            <span className="block mb-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">Lore</span>
            {product.loreDescription}
          </motion.div>
          
          <motion.div
            initial={false}
            animate={{ opacity: showRealWorld ? 1 : 0 }}
            className="absolute inset-0 text-sm text-zinc-300 leading-relaxed"
            style={{ pointerEvents: showRealWorld ? 'auto' : 'none' }}
          >
            <span className="block mb-2 text-xs font-mono text-indigo-500 uppercase tracking-widest">Reality</span>
            {product.realWorldDescription}
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-zinc-800">
          <button
            onClick={() => setShowRealWorld(!showRealWorld)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 flex-shrink-0"
            title="Toggle Reality View"
          >
            {showRealWorld ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={() => onBuy(product)}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <ShoppingCart size={18} />
            Acquire
          </button>
        </div>
      </div>
    </div>
  );
}
