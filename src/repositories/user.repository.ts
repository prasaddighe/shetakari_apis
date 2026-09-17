import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User, CreateUserDTO, UpdateUserDTO, UserWithoutPassword } from '../types/user.js';

export class UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const defaultUsers: (CreateUserDTO & { password?: string })[] = [
      { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'admin', password: 'Password123' },
      { name: 'Priya Patel', email: 'priya@example.com', role: 'user', password: 'Password123' },
      { name: 'Amit Kumar', email: 'amit@example.com', role: 'user', password: 'Password123' },
    ];

    for (const userData of defaultUsers) {
      this.create(userData);
    }
  }

  public sanitizeUser(user: User): UserWithoutPassword {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public findAll(): UserWithoutPassword[] {
    return Array.from(this.users.values()).map(this.sanitizeUser);
  }

  public findById(id: string): User | undefined {
    return this.users.get(id);
  }

  public findByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase().trim();
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === normalized
    );
  }

  public create(data: CreateUserDTO): User {
    const now = new Date().toISOString();
    const rawPassword = data.password || 'DefaultPassword123';
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    const newUser: User = {
      id: randomUUID(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  public update(id: string, data: UpdateUserDTO): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    let hashedPassword = existing.password;
    if (data.password) {
      hashedPassword = bcrypt.hashSync(data.password, 10);
    }

    const updatedUser: User = {
      ...existing,
      ...(data.name && { name: data.name.trim() }),
      ...(data.email && { email: data.email.toLowerCase().trim() }),
      ...(data.role && { role: data.role }),
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  public delete(id: string): boolean {
    return this.users.delete(id);
  }
}
