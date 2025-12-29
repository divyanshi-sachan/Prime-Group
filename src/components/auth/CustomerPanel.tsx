"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Facebook, Linkedin, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { SocialButton } from './SocialButton';
import { AuthInput } from './AuthInput';
import { useAuth } from '../hooks/useAuth';
import { AuthFormData } from '../types/auth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

export function CustomerPanel() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: AuthFormData) => {
    if (isSignUp) {
      await signUp(data, 'customer');
    } else {
      await signIn(data, 'customer');
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        {isSignUp ? 'Create Customer Account' : 'Sign in to Customer Account'}
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-sm mx-auto">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">Sign in with</p>
          <div className="flex justify-center space-x-4">
            <SocialButton icon={Facebook} label="Facebook" />
            <SocialButton icon={Linkedin} label="LinkedIn" />
            <SocialButton icon={Chrome} label="Google" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or use your email account</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <AuthInput
            type="email"
            name="email"
            placeholder="Email"
            icon={Mail}
            register={register}
            error={errors.email?.message}
          />
          <AuthInput
            type="password"
            name="password"
            placeholder="Password"
            icon={Lock}
            register={register}
            error={errors.password?.message}
          />
          
          {!isSignUp && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-gray-300 text-[#c29112] focus:ring-[#c29112]"
                />
                <span className="ml-2 text-sm text-gray-600">Remember Me</span>
              </label>
              <a href="#" className="text-sm text-[#c29112] hover:text-[#c29112]">
                Forgot Password?
              </a>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#c29112] text-white py-2 px-4 rounded-lg hover:bg-[#c29112] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : 'New customer?'}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#c29112] hover:text-[#c29112] font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up as Customer'}
          </button>
        </p>
      </form>
    </div>
  );
}