export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UserParams {
  id: string;
}
