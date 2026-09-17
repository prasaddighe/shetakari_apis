import { randomUUID } from 'node:crypto';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.js';

export class UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    const defaultUsers: CreateUserDTO[] = [
      { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'admin' },
      { name: 'Priya Patel', email: 'priya@example.com', role: 'user' },
      { name: 'Amit Kumar', email: 'amit@example.com', role: 'user' },
    ];

    for (const userData of defaultUsers) {
      this.create(userData);
    }
  }

  public findAll(): User[] {
    return Array.from(this.users.values());
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
    const newUser: User = {
      id: randomUUID(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
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

    const updatedUser: User = {
      ...existing,
      ...(data.name && { name: data.name.trim() }),
      ...(data.email && { email: data.email.toLowerCase().trim() }),
      ...(data.role && { role: data.role }),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  public delete(id: string): boolean {
    return this.users.delete(id);
  }
}
