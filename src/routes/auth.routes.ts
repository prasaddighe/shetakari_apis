import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

export async function authRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService, userService);

  fastify.post('/register', { schema: registerSchema }, authController.registerHandler);
  fastify.post('/login', { schema: loginSchema }, authController.loginHandler);
  fastify.get('/me', authController.meHandler);
}
