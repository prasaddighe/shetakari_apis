import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { RegisterDTO, LoginDTO, SendOtpDTO, VerifyOtpDTO } from '../types/user.js';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  public registerHandler = async (
    request: FastifyRequest<{ Body: RegisterDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.authService.register(request.body);
    return reply.status(201).send(result);
  };

  public loginHandler = async (
    request: FastifyRequest<{ Body: LoginDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.authService.login(request.body);
    return reply.status(200).send(result);
  };

  public sendOtpHandler = async (
    request: FastifyRequest<{ Body: SendOtpDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.authService.sendOtp(request.body);
    return reply.status(200).send(result);
  };

  public verifyOtpHandler = async (
    request: FastifyRequest<{ Body: VerifyOtpDTO }>,
    reply: FastifyReply
  ) => {
    const result = await this.authService.verifyOtp(request.body);
    return reply.status(200).send(result);
  };

  public meHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      await request.jwtVerify();
      const userPayload = request.user as { id: string };
      const user = this.userService.getUserById(userPayload.id);
      const { password, ...userWithoutPassword } = user as any;
      return reply.status(200).send({
        success: true,
        data: userWithoutPassword,
      });
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: {
          statusCode: 401,
          message: 'Unauthorized access token',
        },
      });
    }
  };
}
