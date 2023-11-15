import path from 'path';

import cors from '@fastify/cors';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import fastifySocketIO from 'fastify-socket.io';

import registerGameHandler from './socket/game-handler';
import registerLobbyHandler from './socket/lobby-handler';
import { GameServer } from './types/server';

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
  const io = (fastify as unknown as { io: GameServer }).io;
  io.on('connection', (socket) => {
    registerLobbyHandler(io, socket);
    registerGameHandler(io, socket);
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
