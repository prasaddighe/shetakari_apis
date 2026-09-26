export const userCoreSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    mobileNumber: { type: 'string' },
    village: { type: 'string' },
    district: { type: 'string' },
    state: { type: 'string' },
    email: { type: 'string' },
    profileImage: { type: 'string' },
    role: { type: 'string', enum: ['superadmin', 'admin', 'farmer'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
      },
      village: { type: 'string', minLength: 1, maxLength: 200 },
      district: { type: 'string', minLength: 1, maxLength: 200 },
      state: { type: 'string', minLength: 1, maxLength: 200 },
      email: { type: 'string', format: 'email' },
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
        data: userCoreSchema,
      },
    },
  },
} as const;

export const updateUserSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      mobileNumber: {
        type: 'string',
        pattern: '^(\\+91)?[6-9]\\d{9}$',
      },
      village: { type: 'string', minLength: 1, maxLength: 200 },
      district: { type: 'string', minLength: 1, maxLength: 200 },
      state: { type: 'string', minLength: 1, maxLength: 200 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6, maxLength: 128 },
      profileImage: { type: 'string', format: 'uri' },
      role: { type: 'string', enum: ['superadmin', 'admin', 'farmer'] },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: userCoreSchema,
      },
    },
  },
} as const;

export const getUserParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: userCoreSchema,
      },
    },
  },
} as const;

export const getUsersSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        total: { type: 'integer' },
        data: {
          type: 'array',
          items: userCoreSchema,
        },
      },
    },
  },
} as const;
