import React from 'react';
import { Camera, Users } from 'lucide-react';

interface AuthSelectorProps {
  activePanel: 'customer' | 'photographer';
  onPanelChange: (panel: 'customer' | 'photographer') => void;
}

export function AuthSelector({ activePanel, onPanelChange }: AuthSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-2 mb-1 inline-block mx-auto w-full">
      <div className="flex space-x-2">
        <button
          onClick={() => onPanelChange('customer')}
          className={`flex justify-center	items-center space-x-2 px-6 py-3 rounded-lg transition-all w-1/2 ${
            activePanel === 'customer'
              ? 'bg-[#c29112] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Customer</span>
        </button>
        <button
          onClick={() => onPanelChange('photographer')}
          className={`flex justify-center	items-center space-x-2 px-6 py-3 rounded-lg transition-all w-1/2 ${
            activePanel === 'photographer'
              ? 'bg-[#c29112] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="font-medium">Photographer</span>
        </button>
      </div>
    </div>
  );
}