"use client";

import React from 'react';
import { CustomerPanel } from '@/components/auth/CustomerPanel';

export default function Login() {
  return (
    <div className="max-h-screen min-h-screen flex items-center justify-center p-4">
      <div className="md:w-[70%] max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <CustomerPanel />
          </div>
        </div>
      </div>
    </div>
  );
}