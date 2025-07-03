'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient, RoleDTO, PermissionDTO, UserDTO, CreatePermissionDTO } from '@/lib/api';
import { 
  Settings, 
  Shield, 
  Key, 
  Plus, 
  Trash2, 
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function RolePermissionManager() {
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);

  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [newPermission, setNewPermission] = useState<CreatePermissionDTO>({
    role_id: '',
    action_name: '',
    resource_name: '',
    resource_id: '',
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permissionsData, usersData] = await Promise.all([
        apiClient.getAllRoles(),
        apiClient.getAllPermissions(),
        apiClient.getUsers(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setUsers(usersData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsLoading(true);
    try {
      await apiClient.createRole({ name: newRoleName });
      setSuccess('Role created successfully');
      setNewRoleName('');
      setIsCreateRoleOpen(false);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.deleteRole(roleId);
      setSuccess('Role deleted successfully');
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermission.role_id || !newPermission.action_name || !newPermission.resource_name) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.createPermission(newPermission);
      setSuccess('Permission created successfully');
      setNewPermission({
        role_id: '',
        action_name: '',
        resource_name: '',
        resource_id: '',
      });
      setIsCreatePermissionOpen(false);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.deletePermission(permissionId);
      setSuccess('Permission deleted successfully');
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleId) {
      setError('Please select both user and role');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.assignRoleToUser(selectedUserId, selectedRoleId);
      setSuccess('Role assigned successfully');
      setSelectedUserId('');
      setSelectedRoleId('');
      setIsAssignRoleOpen(false);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign role');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-bold">Role & Permission Management</h2>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
          <Button variant="ghost" size="sm" onClick={clearMessages}>×</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Roles</span>
              </div>
              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div>
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="Enter role name"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateRoleOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        Create Role
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading roles...</div>
            ) : (
              <div className="space-y-3">
                {roles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No roles found.
                  </div>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-medium">{role.name || 'Unnamed Role'}</h4>
                        <p className="text-sm text-gray-600">
                          {role.permissions_count} permission(s)
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Permissions</span>
              </div>
              <Dialog open={isCreatePermissionOpen} onOpenChange={setIsCreatePermissionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Permission
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Permission</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePermission} className="space-y-4">
                    <div>
                      <Label htmlFor="roleSelect">Role</Label>
                      <select
                        id="roleSelect"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newPermission.role_id}
                        onChange={(e) => setNewPermission(prev => ({ ...prev, role_id: e.target.value }))}
                        required
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name || 'Unnamed Role'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="actionName">Action</Label>
                      <select
                        id="actionName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newPermission.action_name}
                        onChange={(e) => setNewPermission(prev => ({ ...prev, action_name: e.target.value }))}
                        required
                      >
                        <option value="">Select action</option>
                        <option value="r">Read</option>
                        <option value="rw">Read/Write</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="resourceName">Resource</Label>
                      <select
                        id="resourceName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newPermission.resource_name}
                        onChange={(e) => setNewPermission(prev => ({ ...prev, resource_name: e.target.value }))}
                        required
                      >
                        <option value="">Select resource</option>
                        <option value="user">User</option>
                        <option value="role">Role</option>
                        <option value="link">Link</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="resourceId">Resource ID (Optional)</Label>
                      <Input
                        id="resourceId"
                        value={newPermission.resource_id || ''}
                        onChange={(e) => setNewPermission(prev => ({ ...prev, resource_id: e.target.value }))}
                        placeholder="Leave empty for global permissions"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreatePermissionOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        Create Permission
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading permissions...</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {permissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No permissions found.
                  </div>
                ) : (
                  permissions.map((permission) => (
                    <div key={permission.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{permission.action_name}</span>
                          <span className="text-gray-500">on</span>
                          <span className="font-medium">{permission.resource_name}</span>
                        </div>
                        {permission.resource_id && (
                          <p className="text-sm text-gray-600">ID: {permission.resource_id}</p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePermission(permission.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Role Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Assign Roles to Users</span>
            </div>
            <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Role to User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignRole} className="space-y-4">
                  <div>
                    <Label htmlFor="userSelect">User</Label>
                    <select
                      id="userSelect"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} (@{user.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="roleSelectAssign">Role</Label>
                    <select
                      id="roleSelectAssign"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name || 'Unnamed Role'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAssignRoleOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      Assign Role
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Use this section to assign existing roles to users. You can also create new roles and permissions using the sections above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
