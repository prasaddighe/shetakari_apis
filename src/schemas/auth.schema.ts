import { userCoreSchema } from './user.schema.js';

export const registerSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      mobileNumber: { type: 'string' },
      village: { type: 'string' },
      district: { type: 'string' },
      state: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      profileImage: { type: 'string' },
      role: { type: 'string', enum: ['admin', 'user', 'farmer'], default: 'farmer' },
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
  },
} as const;

export const loginSchema = {
  body: {
    type: 'object',
    properties: {
      mobileNumber: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
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
  },
} as const;
