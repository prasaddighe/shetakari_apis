import Fastify from 'fastify';
import cors from '@fastify/cors';
import { userRoutes } from './routes/user.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
  });

  // Enable CORS
  app.register(cors, {
    origin: true,
  });

  // Health Check Endpoint
  app.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Register User API Routes
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
