import path from 'path';

import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8000;

const fastify = Fastify({
  logger: true,
});

fastify.register(cors);

fastify.get('/', () => {
  return { hello: 'world' };
});

async function start() {
  try {
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
