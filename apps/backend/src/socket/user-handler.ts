import { GameServer, GameSocket } from '../types/server';

export default function registerUserHandler(
  io: GameServer,
  socket: GameSocket,
) {
  socket.on('user:set-name', async (newName) => {
    socket.data.displayName = newName;
  });
}
