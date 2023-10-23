import { Server } from 'socket.io';

import { GameServer } from '../types/server';

import registerUserHandler from './user-handler';

const io = new Server() as GameServer;

io.on('connection', (socket) => {
  registerUserHandler(io, socket);
});

export default io;
