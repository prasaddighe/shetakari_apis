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
      {
        name: 'Super Admin',
        mobileNumber: '9000000001',
        email: 'superadmin@example.com',
        role: 'superadmin',
        password: 'Password123'
      },
      {
        name: 'System Admin',
        mobileNumber: '9000000002',
        email: 'admin@example.com',
        role: 'admin',
        password: 'Password123'
      },
      {
        name: 'Rahul Sharma',
        mobileNumber: '9876543210',
        village: 'Khed',
        district: 'Pune',
        state: 'Maharashtra',
        email: 'rahul@example.com',
        role: 'farmer',
        password: 'Password123'
      },
      {
        name: 'Priya Patel',
        mobileNumber: '9123456789',
        village: 'Baramati',
        district: 'Pune',
        state: 'Maharashtra',
        email: 'priya@example.com',
        role: 'farmer',
        password: 'Password123'
      },
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
      (user) => user.email && user.email.toLowerCase() === normalized
    );
  }

  public findByMobileNumber(mobileNumber: string): User | undefined {
    const normalized = mobileNumber.trim().replace(/^\+91/, '');
    return Array.from(this.users.values()).find(
      (user) => user.mobileNumber && user.mobileNumber.trim().replace(/^\+91/, '') === normalized
    );
  }

  public create(data: CreateUserDTO): User {
    const now = new Date().toISOString();
    const rawPassword = data.password || 'DefaultPassword123';
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    const newUser: User = {
      id: randomUUID(),
      name: data.name.trim(),
      mobileNumber: data.mobileNumber ? data.mobileNumber.trim() : undefined,
      village: data.village ? data.village.trim() : undefined,
      district: data.district ? data.district.trim() : undefined,
      state: data.state ? data.state.trim() : undefined,
      email: data.email ? data.email.toLowerCase().trim() : undefined,
      profileImage: data.profileImage ? data.profileImage.trim() : undefined,
      password: hashedPassword,
      role: data.role || 'farmer',
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
      ...(data.mobileNumber && { mobileNumber: data.mobileNumber.trim() }),
      ...(data.village && { village: data.village.trim() }),
      ...(data.district && { district: data.district.trim() }),
      ...(data.state && { state: data.state.trim() }),
      ...(data.email && { email: data.email.toLowerCase().trim() }),
      ...(data.profileImage && { profileImage: data.profileImage.trim() }),
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
