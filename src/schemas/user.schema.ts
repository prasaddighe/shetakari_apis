export const userCoreSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['admin', 'user'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'user'], default: 'user' },
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
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'user'] },
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
