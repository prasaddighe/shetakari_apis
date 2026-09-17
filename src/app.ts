import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { userRoutes } from './routes/user.routes.js';
import { authRoutes } from './routes/auth.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
  });

  // Enable CORS
  app.register(cors, {
    origin: true,
  });

  // Register JWT Plugin
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'fallback-super-secret-jwt-key',
  });

  // Root & Health Check Endpoints
  app.get('/', async () => {
    return {
      status: 'OK',
      message: 'Fastify User & Auth API is running cleanly',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/health', async () => {
    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/api/health', async () => {
    return {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  // Register API Routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(userRoutes, { prefix: '/api/users' });

  // Custom Error Handler
  app.setErrorHandler((error: any, _request, reply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Log unexpected 500 errors
    if (statusCode === 500) {
      app.log.error(error);
    }

    reply.status(statusCode).send({
      success: false,
      error: {
        statusCode,
        message,
        ...(error.validation && { validation: error.validation }),
      },
    });
  });

  return app;
}
