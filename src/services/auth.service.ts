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
    // Check duplicate mobile number if provided
    if (dto.mobileNumber) {
      const existingMobile = this.userRepository.findByMobileNumber(dto.mobileNumber);
      if (existingMobile) {
        const error = new Error(`User with mobile number '${dto.mobileNumber}' is already registered`);
        (error as any).statusCode = 409;
        throw error;
      }
    }

    // Check duplicate email if provided
    if (dto.email) {
      const existingEmail = this.userRepository.findByEmail(dto.email);
      if (existingEmail) {
        const error = new Error(`User with email '${dto.email}' is already registered`);
        (error as any).statusCode = 409;
        throw error;
      }
    }

    const createdUser = this.userRepository.create(dto);
    const sanitized = this.userRepository.sanitizeUser(createdUser);

    const token = jwt.sign(
      { id: sanitized.id, name: sanitized.name, mobileNumber: sanitized.mobileNumber, role: sanitized.role },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      success: true,
      message: 'Farmer account created successfully',
      token,
      user: sanitized,
    };
  }

  public async login(dto: LoginDTO): Promise<AuthResponse> {
    let user;
    if (dto.mobileNumber) {
      user = this.userRepository.findByMobileNumber(dto.mobileNumber);
    } else if (dto.email) {
      user = this.userRepository.findByEmail(dto.email);
    }

    if (!user) {
      const error = new Error('User not found with provided mobile number or email');
      (error as any).statusCode = 404;
      throw error;
    }

    // If password provided, verify hash
    if (dto.password && user.password) {
      const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
      if (!isPasswordValid) {
        const error = new Error('Invalid credentials');
        (error as any).statusCode = 401;
        throw error;
      }
    }

    const sanitized = this.userRepository.sanitizeUser(user);

    const token = jwt.sign(
      { id: sanitized.id, name: sanitized.name, mobileNumber: sanitized.mobileNumber, role: sanitized.role },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      success: true,
      message: 'Login successful',
      token,
      user: sanitized,
    };
  }
}
