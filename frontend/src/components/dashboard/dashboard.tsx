'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LinkManager } from '@/components/links/link-manager';
import { AdminPanel } from '@/components/admin/admin-panel';
import { apiClient, UserDTO } from '@/lib/api';
import { LogOut, Link as LinkIcon, Shield, User } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'links' | 'admin'>('links');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [user, adminStatus] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.isAdmin(),
      ]);
      setCurrentUser(user);
      setIsAdmin(adminStatus);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Force logout even if API call fails
    }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile-first header layout */}
          <div className="flex flex-col space-y-3 py-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            
            {/* Top row - Title and mobile logout */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  <span className="hidden sm:inline">Link Shortener</span>
                  <span className="sm:hidden">Links</span>
                </h1>
                
                {/* User info - visible on larger screens */}
                {currentUser && (
                  <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{currentUser.name}</span>
                    {isAdmin && (
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        Admin
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mobile logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="sm:hidden flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline">Logout</span>
              </Button>
            </div>

            {/* User info for mobile - separate row */}
            {currentUser && (
              <div className="md:hidden flex items-center space-x-2 text-sm text-gray-600 pb-2 border-b border-gray-100">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{currentUser.name}</span>
                {isAdmin && (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
            )}
            
            {/* Navigation and desktop logout */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              {/* Navigation Tabs */}
              <nav className="flex space-x-1 flex-1 sm:flex-none">
                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center sm:justify-start ${
                    activeTab === 'links'
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">My Links</span>
                  <span className="xs:hidden sm:hidden">Links</span>
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none justify-center sm:justify-start ${
                      activeTab === 'admin'
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden xs:inline sm:inline">Admin</span>
                    <span className="xs:hidden sm:hidden">Panel</span>
                  </button>
                )}
              </nav>
              
              {/* Desktop logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
                <span className="md:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'links' && <LinkManager />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}
