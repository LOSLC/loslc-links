'use client';

import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { Dashboard } from '@/components/dashboard/dashboard';
import { apiClient } from '@/lib/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await apiClient.getCurrentUser();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Link Shortener
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Create and manage your shortened links
            </p>
          </div>
          <AuthForm onSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}
