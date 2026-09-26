import { userCoreSchema } from './user.schema.js';

// Common error response schema (reusable across all auth endpoints)
const errorResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    error: {
      type: 'object',
      properties: {
        statusCode: { type: 'integer' },
        message: { type: 'string' },
      },
    },
  },
} as const;

export const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'mobileNumber'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
        // 10-digit Indian mobile (optionally prefixed with +91), must start with 6-9
      },
      village: { type: 'string', minLength: 1, maxLength: 200 },
      district: { type: 'string', minLength: 1, maxLength: 200 },
      state: { type: 'string', minLength: 1, maxLength: 200 },
      email: {
        type: 'string',
        format: 'email',
        // Standard email format validation
      },
      password: { type: 'string', minLength: 6, maxLength: 128 },
      profileImage: { type: 'string', format: 'uri' },
      role: { type: 'string', enum: ['superadmin', 'admin', 'farmer'], default: 'farmer' },
    },
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' },
        user: userCoreSchema,
      },
    },
    400: errorResponseSchema,
    409: errorResponseSchema,
  },
} as const;

export const loginSchema = {
  body: {
    type: 'object',
    // At least one of mobileNumber or email is required (validated in service layer)
    properties: {
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
      },
      email: {
        type: 'string',
        format: 'email',
      },
      password: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' },
        user: userCoreSchema,
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
  },
} as const;

export const sendOtpSchema = {
  body: {
    type: 'object',
    required: ['mobileNumber'],
    properties: {
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        isNewUser: { type: 'boolean' },
        otp: { type: 'string' },
      },
    },
    400: errorResponseSchema,
  },
} as const;

export const verifyOtpSchema = {
  body: {
    type: 'object',
    required: ['mobileNumber', 'otp'],
    properties: {
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
      },
      otp: {
        type: 'string',
        pattern: '^\\d{6}$',
        minLength: 6,
        maxLength: 6,
        // Exactly 6-digit numeric OTP
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' },
        isNewUser: { type: 'boolean' },
        user: userCoreSchema,
      },
    },
    400: errorResponseSchema,
  },
} as const;
