import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';
import { UserController } from '../controllers/user.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  getUsersSchema,
  getUserParamsSchema,
  createUserSchema,
  updateUserSchema,
} from '../schemas/user.schema.js';

export async function userRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  // Dependency Injection setup
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  // Register endpoints
  fastify.get('/', { schema: getUsersSchema }, userController.getUsersHandler);
  fastify.get('/:id', { schema: getUserParamsSchema }, userController.getUserByIdHandler);
  fastify.post(
    '/',
    {
      schema: createUserSchema,
      preHandler: [authorizeRoles('superadmin', 'admin')],
    },
    userController.createUserHandler as any
  );
  fastify.put('/:id', { schema: updateUserSchema }, userController.updateUserHandler);
  fastify.delete('/:id', userController.deleteUserHandler);
}

