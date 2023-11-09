import path from 'path';

import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';

import registerLobbyHandler from './socket/lobby-handler';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, { origin: FRONTEND_URL });

console.log('registering socketio...');
fastify.register(fastifySocketIO, {
  cors: { origin: FRONTEND_URL },
});

fastify.get('/', () => {
  return { hello: 'world' };
});

console.log('le troll!');
fastify.ready().then(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fastify.io.on('connection', (socket) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    registerLobbyHandler(fastify.io, socket);
  });
});

async function start() {
  try {
    fastify.log.info('listening!');
    await fastify.listen({ port: PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
