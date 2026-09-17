import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { RegisterDTO, LoginDTO, AuthResponse } from '../types/user.js';

export class AuthService {
  private jwtSecret: string;

  constructor(private userRepository: UserRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key';
  }

  public async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existingUser = this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      const error = new Error(`User with email '${dto.email}' is already registered`);
      (error as any).statusCode = 409;
      throw error;
    }

    const createdUser = this.userRepository.create(dto);
    const sanitized = this.userRepository.sanitizeUser(createdUser);

    const token = jwt.sign(
      { id: sanitized.id, email: sanitized.email, role: sanitized.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitized,
    };
  }

  public async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = this.userRepository.findByEmail(dto.email);
    if (!user || !user.password) {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;
      throw error;
    }

    const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      (error as any).statusCode = 401;
      throw error;
    }

    const sanitized = this.userRepository.sanitizeUser(user);

    const token = jwt.sign(
      { id: sanitized.id, email: sanitized.email, role: sanitized.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      message: 'Login successful',
      token,
      user: sanitized,
    };
  }
}
