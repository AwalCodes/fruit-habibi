'use client';

import { ReactNode } from 'react';
import I18nWrapper from './I18nWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <I18nWrapper>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </I18nWrapper>
  );
}

