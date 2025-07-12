'use client';

import { useState, useEffect } from 'react';
import { AdminPanel } from '@/components/admin/admin-panel';
import { LinkManager } from '@/components/links/link-manager';
import { apiClient, UserDTO } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  TrendingUp, 
  Link as LinkIcon,
  AlertTriangle,
  LogOut,
  User
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'admin' | 'links'>('admin');

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
    } catch {
      setError('Failed to load user data');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      onLogout(); // Force logout even if API call fails
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Access Denied</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            {error || 'You do not have administrator privileges to access this page.'}
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Return to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
            {/* Left section - Logo and title */}
            <div className="flex items-center justify-between sm:justify-start">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700 flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  <span className="hidden sm:inline">Admin Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                </h1>
              </div>
              
              {/* Mobile logout button */}
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="sm:hidden ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Welcome message - hidden on mobile, shown on tablet+ */}
            {currentUser && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 order-2 sm:order-none">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Welcome, {currentUser.name}</span>
              </div>
            )}

            {/* Right section - Controls */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
              {/* Section Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 flex-1 sm:flex-none">
                <button
                  onClick={() => setActiveSection('admin')}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors text-center ${
                    activeSection === 'admin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sm:hidden">Panel</span>
                </button>
                <button
                  onClick={() => setActiveSection('links')}
                  className={`flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors text-center ${
                    activeSection === 'links'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="hidden sm:inline">My Links</span>
                  <span className="sm:hidden">Links</span>
                </button>
              </div>

              {/* Desktop logout button */}
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex flex-shrink-0"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
                <span className="md:hidden">Exit</span>
              </Button>
            </div>
          </div>

          {/* Mobile welcome message */}
          {currentUser && (
            <div className="md:hidden pb-3 pt-1 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Welcome, {currentUser.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeSection === 'admin' ? (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Admin Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-l-4 border-l-gray-400 shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Admin Panel
                  </CardTitle>
                  <Shield className="h-4 w-4 text-gray-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-lg font-semibold text-gray-800">
                    User & Role Management
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gray-500 shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    System Status
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-lg font-semibold text-gray-800">
                    Operational
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gray-600 shadow-sm border-gray-200 sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Current User
                  </CardTitle>
                  <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                    {currentUser?.name}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Panel */}
            <AdminPanel />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Links</h2>
            </div>
            <LinkManager />
          </div>
        )}
      </div>
    </div>
  );
}
