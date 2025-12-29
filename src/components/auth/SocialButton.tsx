import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SocialButtonProps {
  icon: LucideIcon;
  label: string;
}

export function SocialButton({ icon: Icon, label }: SocialButtonProps) {
  return (
    <button className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 hover:border-[#c29112] hover:bg-[#fff9e9] transition-colors">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="sr-only">Sign in with {label}</span>
    </button>
  );
}