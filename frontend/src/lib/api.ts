import ky from 'ky';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  name: string;
}

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface LinkDTO {
  id: string;
  label: string;
  url: string;
  description?: string;
  created_at: string;
  author_id: string;
}

export interface LinkCreationDTO {
  label: string;
  url: string;
  description?: string;
}

export interface LinkUpdateDTO {
  id: string;
  label: string;
  url: string;
  description?: string;
}

export interface RoleDTO {
  id: string;
  name?: string;
  permissions_count: number;
}

export interface PermissionDTO {
  id: string;
  action_name: string;
  resource_name: string;
  resource_id?: string;
}

export interface CreateRoleDTO {
  name: string;
}

export interface CreatePermissionDTO {
  role_id: string;
  action_name: string;
  resource_name: string;
  resource_id?: string;
}

export interface AssignRoleDTO {
  user_id: string;
  role_id: string;
}

export interface MessageResponse {
  message: string;
}

class ApiClient {
  private api: typeof ky;

  constructor() {
    this.api = ky.create({
      prefixUrl: API_BASE_URL,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      hooks: {
        beforeError: [
          async (error) => {
            const { response } = error;
            if (response && response.body) {
              const errorText = await response.text();
              error.message = errorText || `HTTP error! status: ${response.status}`;
            }
            return error;
          }
        ]
      }
    });
  }

  // Auth endpoints
  async login(data: LoginData): Promise<MessageResponse> {
    return this.api.post('api/v1/auth/login', { json: data }).json();
  }

  async register(data: RegisterData): Promise<MessageResponse> {
    return this.api.post('api/v1/auth/register', { json: data }).json();
  }

  async logout(): Promise<MessageResponse> {
    return this.api.post('api/v1/auth/logout').json();
  }

  async getCurrentUser(): Promise<UserDTO> {
    return this.api.get('api/v1/auth/me').json();
  }

  // Link endpoints
  async getMyLinks(skip = 0, limit = 10): Promise<LinkDTO[]> {
    return this.api.get(`api/v1/links?skip=${skip}&limit=${limit}`).json();
  }

  async getLinkById(id: string): Promise<LinkDTO> {
    return this.api.get(`api/v1/links/${id}`).json();
  }

  async getLinkByLabel(label: string): Promise<LinkDTO> {
    return this.api.get(`api/v1/links/label/${label}`).json();
  }

  async createLink(data: LinkCreationDTO): Promise<LinkDTO> {
    return this.api.post('api/v1/links', { json: data }).json();
  }

  async updateLink(data: LinkUpdateDTO): Promise<LinkDTO> {
    return this.api.put('api/v1/links', { json: data }).json();
  }

  async deleteLink(id: string): Promise<MessageResponse> {
    return this.api.delete(`api/v1/links/${id}`).json();
  }

  async getUserLinks(userId: string, skip = 0, limit = 10): Promise<LinkDTO[]> {
    return this.api.get(`api/v1/links/user/${userId}?skip=${skip}&limit=${limit}`).json();
  }

  // User endpoints
  async getUsers(skip = 0, limit = 10): Promise<UserDTO[]> {
    return this.api.get(`api/v1/users?skip=${skip}&limit=${limit}`).json();
  }

  async deleteUser(userId: string): Promise<MessageResponse> {
    return this.api.delete(`api/v1/users/${userId}`).json();
  }

  async getUserRoles(userId: string, skip = 0, limit = 10): Promise<RoleDTO[]> {
    return this.api.get(`api/v1/users/${userId}/roles?skip=${skip}&limit=${limit}`).json();
  }

  async getRolePermissions(roleId: string, skip = 0, limit = 10): Promise<PermissionDTO[]> {
    return this.api.get(`api/v1/users/roles/${roleId}/permissions?skip=${skip}&limit=${limit}`).json();
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<MessageResponse> {
    return this.api.delete(`api/v1/users/${userId}/roles/${roleId}`).json();
  }

  async isAdmin(): Promise<boolean> {
    return this.api.get('api/v1/users/admin-check').json();
  }

  // Role management endpoints
  async getAllRoles(skip = 0, limit = 10): Promise<RoleDTO[]> {
    return this.api.get(`api/v1/users/roles?skip=${skip}&limit=${limit}`).json();
  }

  async createRole(data: CreateRoleDTO): Promise<MessageResponse> {
    return this.api.post('api/v1/users/roles', { json: data }).json();
  }

  async deleteRole(roleId: string): Promise<MessageResponse> {
    return this.api.delete(`api/v1/users/roles/${roleId}`).json();
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<MessageResponse> {
    return this.api.post(`api/v1/users/${userId}/roles/${roleId}`).json();
  }

  // Permission management endpoints
  async getAllPermissions(skip = 0, limit = 10): Promise<PermissionDTO[]> {
    return this.api.get(`api/v1/users/permissions?skip=${skip}&limit=${limit}`).json();
  }

  async createPermission(data: CreatePermissionDTO): Promise<MessageResponse> {
    return this.api.post('api/v1/users/permissions', { json: data }).json();
  }

  async deletePermission(permissionId: string): Promise<MessageResponse> {
    return this.api.delete(`api/v1/users/permissions/${permissionId}`).json();
  }
}

export const apiClient = new ApiClient();
