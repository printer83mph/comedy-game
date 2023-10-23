import Game from '../lib/game';
import { GameServer, GameSocket } from '../types/server';

const lobbies = new Map<string, Game>();

export default function registerLobbyHandler(
  io: GameServer,
  socket: GameSocket,
) {
  socket.on('lobby:create', async () => {
    // make sure we're not in a room already
    for (const room of socket.rooms) {
      if (room.startsWith('lobby-')) {
        socket.emit('client-error', 'Must leave lobby first');
      }
    }

    const lobbyId = `lobby-${crypto.randomUUID()}`;
    const lobby = new Game(io, lobbyId, socket, () => lobbies.delete(lobbyId));
    lobbies.set(lobbyId, lobby);

    try {
      lobby.addPlayer(socket);
      socket.join(lobbyId);
    } catch (err) {
      socket.emit('client-error', (err as Error).message);
    }
  });

  socket.on('lobby:join', (lobbyId) => {
    // make sure we're not in a room already
    for (const room of socket.rooms) {
      if (room.startsWith('lobby-')) {
        socket.emit('client-error', 'Must leave lobby first');
      }
    }

    const game = lobbies.get(lobbyId);
    if (!game) {
      socket.emit('client-error', 'Lobby not found');
      return;
    }

    try {
      game.addPlayer(socket);
      socket.join(lobbyId);
    } catch (err) {
      socket.emit('client-error', (err as Error).message);
    }
  });

  socket.on('disconnect', async () => {
    // TODO
  });
}
