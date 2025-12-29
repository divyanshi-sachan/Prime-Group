import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { AuthFormData } from '../types/auth';

interface AuthInputProps {
  type: string;
  name: keyof AuthFormData;
  placeholder: string;
  icon: LucideIcon;
  register: UseFormRegister<AuthFormData>;
  error?: string;
}

export function AuthInput({ type, name, placeholder, icon: Icon, register, error }: AuthInputProps) {
  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          {...register(name)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}