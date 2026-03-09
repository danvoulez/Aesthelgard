'use client';

import React, { useState } from 'react';
import { ProductCard } from '@/components/bazaar/ProductCard';
import { CheckoutModal } from '@/components/bazaar/CheckoutModal';
import { canonStore } from '@/lib/canonStore';
import { Product, ProductType } from '@/schemas/canon';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Box, FileText, Calendar } from 'lucide-react';

const TABS = [
  { id: 'ALL', label: 'All Wares', icon: ShoppingBag },
  { id: 'PHYSICAL_MERCH', label: 'Artifacts', icon: Box },
  { id: 'DIGITAL_ASSET', label: 'Archival Records', icon: FileText },
  { id: 'LIVE_EVENT', label: 'Gatherings', icon: Calendar },
];

export default function BazaarPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const filteredProducts = activeTab === 'ALL' 
    ? canonStore.products 
    : canonStore.products.filter(p => p.type === activeTab);

  const handleBuy = (product: Product) => {
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12 border-b border-zinc-800 pb-6 md:pb-8">
          <h1 className="text-3xl md:text-5xl font-serif text-zinc-100 mb-3 md:mb-4 tracking-tight">
            The Bazaar of the Upper Tiers
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Procure rare artifacts, uncover hidden lore, and secure passage to exclusive gatherings. The merchants here deal in both the physical and the digital.
          </p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 md:mb-12 pb-2 -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} onBuy={handleBuy} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg">No wares found in this category.</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
