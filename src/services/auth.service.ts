import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { SmsService } from './sms.service.js';
import { RegisterDTO, LoginDTO, SendOtpDTO, VerifyOtpDTO, AuthResponse } from '../types/user.js';

export class AuthService {
  private jwtSecret: string;
  private smsService: SmsService;
  private otpStore: Map<string, string> = new Map();

  constructor(private userRepository: UserRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key';
    this.smsService = new SmsService();
  }

  public async register(dto: RegisterDTO): Promise<AuthResponse> {
    if (dto.mobileNumber) {
      const existingMobile = this.userRepository.findByMobileNumber(dto.mobileNumber);
      if (existingMobile) {
        const error = new Error(`User with mobile number '${dto.mobileNumber}' is already registered`);
        (error as any).statusCode = 409;
        throw error;
      }
    }

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

  public async sendOtp(dto: SendOtpDTO): Promise<{ success: boolean; message: string; otp?: string }> {
    const normalizedMobile = dto.mobileNumber.trim().replace(/^\+91/, '');
    
    // Generate dynamic random 6-digit OTP code
    const generatedOtp = this.smsService.generateOtp();
    this.otpStore.set(normalizedMobile, generatedOtp);

    // Send Real SMS if SMS API key is configured
    await this.smsService.sendSms(normalizedMobile, generatedOtp);

    const isProduction = process.env.NODE_ENV === 'production';
    const hasSmsKey = !!(process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY);

    return {
      success: true,
      message: `OTP sent successfully to ${dto.mobileNumber}`,
      ...(!hasSmsKey && { otp: generatedOtp }),
    };
  }

  public async verifyOtp(dto: VerifyOtpDTO): Promise<AuthResponse> {
    const normalizedMobile = dto.mobileNumber.trim().replace(/^\+91/, '');
    const validOtp = this.otpStore.get(normalizedMobile);

    if (!validOtp || dto.otp.trim() !== validOtp) {
      const error = new Error('Invalid or expired OTP');
      (error as any).statusCode = 400;
      throw error;
    }

    // Clear used OTP
    this.otpStore.delete(normalizedMobile);

    let user = this.userRepository.findByMobileNumber(normalizedMobile);
    if (!user) {
      user = this.userRepository.create({
        name: `Farmer ${normalizedMobile.slice(-4)}`,
        mobileNumber: normalizedMobile,
        role: 'farmer',
      });
    }

    const sanitized = this.userRepository.sanitizeUser(user);
    const token = jwt.sign(
      { id: sanitized.id, name: sanitized.name, mobileNumber: sanitized.mobileNumber, role: sanitized.role },
      this.jwtSecret,
      { expiresIn: '30d' }
    );

    return {
      success: true,
      message: 'OTP verified successfully',
      token,
      user: sanitized,
    };
  }
}
