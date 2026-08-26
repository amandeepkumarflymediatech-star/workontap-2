'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DirectoryListing from '@/components/DirectoryListing';

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-6 max-w-7xl py-12">
          
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 border-b border-slate-100 pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              Local Trades & Services
            </h1>
            <Link 
              href="/services" 
              className="text-[#16A34A] font-semibold hover:underline flex items-center gap-1 mt-4 md:mt-0"
            >
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <DirectoryListing />
        </div>
      </main>

      <Footer />
    </div>
  );
}
