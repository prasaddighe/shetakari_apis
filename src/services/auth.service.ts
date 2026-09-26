import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository.js';
import { SmsService } from './sms.service.js';
import { RegisterDTO, LoginDTO, SendOtpDTO, VerifyOtpDTO, AuthResponse } from '../types/user.js';

// OTP record with expiry tracking
interface OtpRecord {
  code: string;
  expiresAt: number; // timestamp in ms
}

// OTP validity duration: 5 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000;

export class AuthService {
  private jwtSecret: string;
  private smsService: SmsService;
  private otpStore: Map<string, OtpRecord> = new Map();

  constructor(private userRepository: UserRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-super-secret-jwt-key';
    this.smsService = new SmsService();
  }

  // ─── REGISTER ───────────────────────────────────────────────────────
  public async register(dto: RegisterDTO): Promise<AuthResponse> {
    // Validate: name is required (schema handles this, but double-check)
    if (!dto.name || dto.name.trim().length < 2) {
      const error = new Error('Name is required and must be at least 2 characters');
      (error as any).statusCode = 400;
      throw error;
    }

    // Validate: mobileNumber is required for registration
    if (!dto.mobileNumber || dto.mobileNumber.trim().length === 0) {
      const error = new Error('Mobile number is required for registration');
      (error as any).statusCode = 400;
      throw error;
    }

    // Validate: Check duplicate mobile number
    if (dto.mobileNumber) {
      const existingMobile = this.userRepository.findByMobileNumber(dto.mobileNumber);
      if (existingMobile) {
        const error = new Error(`User with mobile number '${dto.mobileNumber}' is already registered`);
        (error as any).statusCode = 409;
        throw error;
      }
    }

    // Validate: Check duplicate email
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

  // ─── LOGIN ──────────────────────────────────────────────────────────
  public async login(dto: LoginDTO): Promise<AuthResponse> {
    // Validate: At least one identifier is required (mobile or email)
    if (!dto.mobileNumber && !dto.email) {
      const error = new Error('Mobile number or email is required for login');
      (error as any).statusCode = 400;
      throw error;
    }

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

    // Validate password if provided
    if (dto.password && user.password) {
      const isPasswordValid = bcrypt.compareSync(dto.password, user.password);
      if (!isPasswordValid) {
        const error = new Error('Invalid credentials - wrong password');
        (error as any).statusCode = 401;
        throw error;
      }
    } else if (!dto.password) {
      // If no password provided and user has a password, reject
      const error = new Error('Password is required for login');
      (error as any).statusCode = 400;
      throw error;
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

  // ─── SEND OTP ───────────────────────────────────────────────────────
  public async sendOtp(dto: SendOtpDTO): Promise<{ success: boolean; message: string; isNewUser: boolean; otp?: string }> {
    // Validate mobile number
    if (!dto.mobileNumber || dto.mobileNumber.trim().length === 0) {
      const error = new Error('Mobile number is required');
      (error as any).statusCode = 400;
      throw error;
    }

    const normalizedMobile = dto.mobileNumber.trim().replace(/^\+91/, '');

    // Check if user already exists - tell frontend
    const existingUser = this.userRepository.findByMobileNumber(normalizedMobile);
    const isNewUser = !existingUser;

    // Generate dynamic random 6-digit OTP code
    const generatedOtp = this.smsService.generateOtp();

    // Store OTP with expiry timestamp
    this.otpStore.set(normalizedMobile, {
      code: generatedOtp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Send Real SMS if SMS API key is configured
    await this.smsService.sendSms(normalizedMobile, generatedOtp);

    const hasSmsKey = !!(process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY);

    return {
      success: true,
      message: isNewUser
        ? `OTP sent to ${dto.mobileNumber}. New user - account will be created on verification.`
        : `OTP sent to ${dto.mobileNumber}. Welcome back!`,
      isNewUser,
      ...(!hasSmsKey && { otp: generatedOtp }),
    };
  }

  // ─── VERIFY OTP ─────────────────────────────────────────────────────
  public async verifyOtp(dto: VerifyOtpDTO): Promise<AuthResponse & { isNewUser: boolean }> {
    // Validate inputs
    if (!dto.mobileNumber || dto.mobileNumber.trim().length === 0) {
      const error = new Error('Mobile number is required');
      (error as any).statusCode = 400;
      throw error;
    }

    if (!dto.otp || dto.otp.trim().length !== 6) {
      const error = new Error('OTP must be exactly 6 digits');
      (error as any).statusCode = 400;
      throw error;
    }

    const normalizedMobile = dto.mobileNumber.trim().replace(/^\+91/, '');
    const otpRecord = this.otpStore.get(normalizedMobile);

    // Check: OTP was never sent for this number
    if (!otpRecord) {
      const error = new Error('No OTP was sent for this mobile number. Please request a new OTP.');
      (error as any).statusCode = 400;
      throw error;
    }

    // Check: OTP has expired (5-minute window)
    if (Date.now() > otpRecord.expiresAt) {
      this.otpStore.delete(normalizedMobile); // Clean up expired OTP
      const error = new Error('OTP has expired. Please request a new OTP.');
      (error as any).statusCode = 400;
      throw error;
    }

    // Check: OTP code matches
    if (dto.otp.trim() !== otpRecord.code) {
      const error = new Error('Invalid OTP code. Please check and try again.');
      (error as any).statusCode = 400;
      throw error;
    }

    // Clear used OTP (one-time use)
    this.otpStore.delete(normalizedMobile);

    // Check if user exists or needs to be created
    let user = this.userRepository.findByMobileNumber(normalizedMobile);
    let isNewUser = false;

    if (!user) {
      // Auto-create new farmer account on first OTP login
      isNewUser = true;
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
      message: isNewUser
        ? 'OTP verified - new farmer account created successfully'
        : 'OTP verified - login successful',
      token,
      isNewUser,
      user: sanitized,
    };
  }
}

