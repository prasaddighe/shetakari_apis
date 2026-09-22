import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types/user.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: {
        statusCode: 401,
        message: 'Unauthorized: Invalid or missing token',
      },
    });
  }
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Ensure authentication has run
    if (!request.user) {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: {
            statusCode: 401,
            message: 'Unauthorized: Invalid or missing token',
          },
        });
      }
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: {
          statusCode: 403,
          message: `Forbidden: Only ${allowedRoles.join(' and ')} have permission to perform this action`,
        },
      });
    }
  };
}
