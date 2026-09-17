export type UserRole = 'admin' | 'user' | 'farmer';

export interface User {
  id: string;
  name: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  state?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface CreateUserDTO {
  name: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  state?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  state?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  role?: UserRole;
}

export interface UserParams {
  id: string;
}

export interface RegisterDTO {
  name: string;
  mobileNumber?: string;
  village?: string;
  district?: string;
  state?: string;
  email?: string;
  password?: string;
  profileImage?: string;
  role?: UserRole;
}

export interface LoginDTO {
  mobileNumber?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: UserWithoutPassword;
}
