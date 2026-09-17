import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service.js';
import { CreateUserDTO, UpdateUserDTO, UserParams } from '../types/user.js';

export class UserController {
  constructor(private userService: UserService) {}

  public getUsersHandler = async (
    _request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const users = this.userService.getAllUsers();
    return reply.status(200).send({
      success: true,
      total: users.length,
      data: users,
    });
  };

  public getUserByIdHandler = async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const user = this.userService.getUserById(id);
    return reply.status(200).send({
      success: true,
      data: user,
    });
  };

  public createUserHandler = async (
    request: FastifyRequest<{ Body: CreateUserDTO }>,
    reply: FastifyReply
  ) => {
    const newUser = this.userService.createUser(request.body);
    return reply.status(201).send({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  };

  public updateUserHandler = async (
    request: FastifyRequest<{ Params: UserParams; Body: UpdateUserDTO }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const updatedUser = this.userService.updateUser(id, request.body);
    return reply.status(200).send({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  };

  public deleteUserHandler = async (
    request: FastifyRequest<{ Params: UserParams }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    this.userService.deleteUser(id);
    return reply.status(200).send({
      success: true,
      message: `User with ID '${id}' deleted successfully`,
    });
  };
}
