import { useState } from 'react';
import { AuthFormData, UserType } from '../types/auth';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (data: AuthFormData, userType: UserType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log(`Signing in ${userType}:`, data);
      
      // Simulate successful login
      localStorage.setItem('userType', userType);
      if (data.rememberMe) {
        localStorage.setItem('email', data.email);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: AuthFormData, userType: UserType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log(`Signing up ${userType}:`, data);
      
      // Simulate successful registration
      localStorage.setItem('userType', userType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    signIn,
    signUp
  };
}