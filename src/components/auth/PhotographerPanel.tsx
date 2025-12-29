"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Mail, Lock, Loader2 } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { useAuth } from '../hooks/useAuth';
import { AuthFormData } from '../types/auth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export function PhotographerPanel() {
  const [isSignUp, setIsSignUp] = useState(true);
  const { signIn, signUp, isLoading, error } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: AuthFormData) => {
    if (isSignUp) {
      await signIn(data, 'photographer');
      
    } else {
      await signUp(data, 'photographer');
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-sm mx-auto">
        <div className="text-center space-y-4 mb-8">
          <Camera className="w-16 h-16 mx-auto text-gray-900" />
          <h2 className="text-2xl font-bold text-gray-900">Hello, Photographer!</h2>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Start showcasing your portfolio with us.'
              : 'Welcome back! Sign in to your account.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#c29112] text-white py-2 px-4 rounded-lg hover:bg-[#c29112] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isSignUp ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 w-full text-center text-sm text-gray-600"
        >
          {isSignUp ? 'Already have an account?' : 'Need an account?'}{' '}
          <span className="text-[#c29112] hover:text-[#c29112] font-medium">
            {isSignUp ? 'Sign Up' : 'Sign In' }
          </span>
        </button>
      </div>
    </div>
  );
}