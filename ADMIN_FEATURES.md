# Admin Panel Features

## Overview
The admin panel provides comprehensive user and role management capabilities for administrators. It features a modern, responsive design with tabbed navigation and real-time updates.

## Features

### User Management
- **User List**: View all registered users with their details
- **User Roles**: Expand user cards to see assigned roles
- **Delete Users**: Remove users from the system
- **Remove Roles**: Remove specific roles from users
- **Responsive Design**: Works on mobile and desktop

### Role & Permission Management
- **Role Creation**: Create new roles with custom names
- **Role Deletion**: Remove roles from the system
- **Permission Creation**: Create granular permissions for roles
- **Permission Types**: Support for read (r) and read/write (rw) actions
- **Resource Types**: Manage permissions for users, roles, links, and admin resources
- **Role Assignment**: Assign existing roles to users

### Security Features
- **Admin-Only Access**: All admin functions require admin privileges
- **Permission Checks**: Backend validates user permissions for each action
- **Session Management**: Secure authentication using HTTP-only cookies
- **Role-Based Access Control**: Granular permissions system

## API Endpoints

### User Management
- `GET /api/v1/users` - Get all users (paginated)
- `DELETE /api/v1/users/{user_id}` - Delete a user
- `GET /api/v1/users/{user_id}/roles` - Get user roles
- `DELETE /api/v1/users/{user_id}/roles/{role_id}` - Remove role from user
- `GET /api/v1/users/admin-check` - Check admin status

### Role Management
- `GET /api/v1/users/roles` - Get all roles
- `POST /api/v1/users/roles` - Create new role
- `DELETE /api/v1/users/roles/{role_id}` - Delete role
- `POST /api/v1/users/{user_id}/roles/{role_id}` - Assign role to user

### Permission Management
- `GET /api/v1/users/permissions` - Get all permissions
- `POST /api/v1/users/permissions` - Create new permission
- `DELETE /api/v1/users/permissions/{permission_id}` - Delete permission
- `GET /api/v1/users/roles/{role_id}/permissions` - Get role permissions

## Frontend Components

### AdminDashboard
Main dashboard component that includes:
- Authentication check
- Admin privilege verification
- Navigation between admin and personal sections
- Logout functionality

### AdminPanel
Core admin panel with:
- Tabbed interface (Users / Roles & Permissions)
- Responsive user cards with expandable role details
- Real-time updates after actions
- Error and success message handling

### RolePermissionManager
Comprehensive role and permission management:
- Create/delete roles
- Create/delete permissions
- Assign roles to users
- Modal dialogs for all operations
- Form validation and error handling

## Access Control

### Admin Setup
To make a user an admin, add their email to the `ADMIN_EMAILS` environment variable:
```bash
ADMIN_EMAILS="admin@example.com;another@admin.com"
```

### Permission Types
- **r** (Read): View-only access
- **rw** (Read/Write): Full access including create, update, delete

### Resource Types
- **user**: User management permissions
- **role**: Role management permissions  
- **link**: Link management permissions
- **admin**: Administrative permissions

## Usage

1. **Access Admin Panel**: Navigate to `/admin` route
2. **Login**: Use admin credentials to access
3. **Manage Users**: View, delete users, and manage their roles
4. **Manage Roles**: Create roles and assign permissions
5. **Assign Permissions**: Grant specific access levels to roles

The interface is fully responsive and provides immediate feedback for all operations with loading states, error handling, and success confirmations.
