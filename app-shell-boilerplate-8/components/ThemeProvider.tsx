'use client';

import React, { useEffect } from 'react';
import canonData from '@/config/canon.json';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = canonData.theme.css_variables;
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
    
    if (canonData.theme.typography.headings === 'serif') {
      root.style.setProperty('--font-heading', 'var(--font-serif)');
    } else {
      root.style.setProperty('--font-heading', 'var(--font-sans)');
    }
  }, []);

  return <>{children}</>;
}
