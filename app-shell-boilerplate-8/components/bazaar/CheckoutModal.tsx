'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/schemas/canon';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useNarrative } from '@/lib/narrative-context';
import Image from 'next/image';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type CheckoutState = 'CART' | 'REVIEW' | 'PROCESSING' | 'SUCCESS';

export function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [state, setState] = useState<CheckoutState>('CART');
  const { updateInventory } = useNarrative();

  const handleCheckout = () => {
    setState('REVIEW');
  };

  const handleConfirm = () => {
    setState('PROCESSING');
    
    // Simulate payment processing delay
    setTimeout(() => {
      setState('SUCCESS');
      
      // Handle digital unlock if applicable
      if (product && product.unlocksArtifactId) {
        updateInventory(product.unlocksArtifactId);
      }
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setState('CART'), 300); // Reset state after animation
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800">
              <h2 className="text-lg md:text-xl font-serif text-zinc-100">
                {state === 'SUCCESS' ? 'Transaction Complete' : 'Secure Exchange'}
              </h2>
              <button
                onClick={handleClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-6 min-h-[300px] flex flex-col">
              <AnimatePresence mode="wait">
                {state === 'CART' && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-zinc-100">{product.name}</h3>
                        <p className="text-sm text-zinc-400 mt-1">{product.type.replace('_', ' ')}</p>
                        <p className="text-lg font-mono text-indigo-400 mt-2">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={handleCheckout}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </motion.div>
                )}

                {state === 'REVIEW' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="space-y-4 mb-6 text-sm text-zinc-300">
                      <div className="flex justify-between pb-4 border-b border-zinc-800">
                        <span>Item Total</span>
                        <span>${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pb-4 border-b border-zinc-800">
                        <span>Taxes & Fees</span>
                        <span>${(product.price * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-medium text-zinc-100 pt-2">
                        <span>Total Due</span>
                        <span className="text-indigo-400">${(product.price * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-auto flex gap-3">
                      <button
                        onClick={() => setState('CART')}
                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
                      >
                        Confirm Payment
                      </button>
                    </div>
                  </motion.div>
                )}

                {state === 'PROCESSING' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100">Processing Transaction...</h3>
                    <p className="text-sm text-zinc-400 mt-2">Establishing secure connection to the Upper Tiers.</p>
                  </motion.div>
                )}

                {state === 'SUCCESS' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-serif text-zinc-100 mb-2">Acquisition Successful</h3>
                    <p className="text-zinc-400 mb-8 max-w-sm">
                      {product.type === 'DIGITAL_ASSET' 
                        ? 'The digital asset has been unlocked and added to your inventory. The narrative engine has been updated.'
                        : 'Your physical item is being prepared for dispatch.'}
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Return to the Bazaar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
