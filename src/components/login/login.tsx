"use client";

import React, { useState } from 'react';
import { CustomerPanel } from '@/components/auth/CustomerPanel';
import { PhotographerPanel } from '@/components/auth/PhotographerPanel';
import { AuthSelector } from '@/components/auth/AuthSelector';

export default function Login() {
  const [activePanel, setActivePanel] = useState<'customer' | 'photographer'>('customer');

  return (
    <div className="max-h-screen min-h-screen flex items-center justify-center p-4">
      
      <div className="md:w-[70%] max-w-6xl">
        <AuthSelector activePanel={activePanel} onPanelChange={setActivePanel} />
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left Panel - Customer */}
            <div className={`md:w-1/2 p-8 transition-all duration-300 ${
              activePanel === 'customer' ? 'opacity-100' : 'hidden md:block opacity-50 pointer-events-none'
            }`}>
              <CustomerPanel />
            </div>

            {/* Right Panel - Photographer */}
            <div className={`md:w-1/2 p-8 bg-[#fff9e9] transition-all duration-300 ${
              activePanel === 'photographer' ? 'opacity-100' : 'hidden md:block opacity-50 pointer-events-none'
            }`}>
              <PhotographerPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}