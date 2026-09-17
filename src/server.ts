import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 Fastify Server listening on http://localhost:${PORT}`);
    console.log(`📋 User CRUD routes available at http://localhost:${PORT}/api/users\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
