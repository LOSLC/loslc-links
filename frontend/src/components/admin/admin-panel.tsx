'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, UserDTO, RoleDTO } from '@/lib/api';
import { RolePermissionManager } from '@/components/admin/role-permission-manager';
import { 
  Trash2, 
  Users, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  UserCheck,
  Crown
} from 'lucide-react';

export function AdminPanel() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, RoleDTO[]>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRoles = async (userId: string) => {
    try {
      const roles = await apiClient.getUserRoles(userId);
      setUserRoles(prev => ({ ...prev, [userId]: roles }));
    } catch (error) {
      console.error('Failed to load user roles:', error);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await apiClient.deleteUser(userId);
      setSuccess(`User "${userName}" deleted successfully`);
      await loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string, roleName: string) => {
    if (!confirm(`Remove role "${roleName}" from this user?`)) {
      return;
    }

    try {
      await apiClient.removeRoleFromUser(userId, roleId);
      setSuccess('Role removed successfully');
      await loadUserRoles(userId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove role');
    }
  };

  const toggleUserExpansion = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      if (!userRoles[userId]) {
        await loadUserRoles(userId);
      }
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
        </div>
      )}

      {/* Content */}
      {activeTab === 'users' ? (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Users className="h-5 w-5 text-gray-700" />
              <span>User Management</span>
              <span className="text-sm font-normal text-gray-500">
                ({users.length} user{users.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No users found.</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="hover:bg-accent/50 transition-colors duration-200">
                      <div className="flex items-center justify-between p-4 sm:p-6">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 truncate">{user.name}</h4>
                              {user.email.includes('admin') && (
                                <div className="relative group">
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    Admin user
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">@{user.username}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserExpansion(user.id)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            {expandedUser === user.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={isLoading}
                            className="hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded User Details */}
                      {expandedUser === user.id && (
                        <div className="px-4 sm:px-6 pb-4 border-t border-gray-200 bg-gray-50">
                          <div className="pt-4">
                            <h5 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                              <UserCheck className="h-4 w-4 text-gray-700" />
                              <span>User Roles</span>
                            </h5>
                            
                            {userRoles[user.id] ? (
                              userRoles[user.id].length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {userRoles[user.id].map((role) => (
                                    <div
                                      key={role.id}
                                      className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-gray-200 shadow-sm"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                          {role.name || 'Unnamed Role'}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveRole(user.id, role.id, role.name || 'role')}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 py-2">
                                  No roles assigned to this user.
                                </p>
                              )
                            ) : (
                              <div className="text-sm text-gray-500 py-2">
                                Loading roles...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <RolePermissionManager />
      )}
    </div>
  );
}
