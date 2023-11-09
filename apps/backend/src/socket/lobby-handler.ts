import { randomUUID } from 'crypto';

import Game from '../lib/game';
import { GameServer, GameSocket, LobbyID } from '../types/server';

const lobbies = new Map<LobbyID, Game>();

export default function registerLobbyHandler(
  io: GameServer,
  socket: GameSocket,
) {
  socket.on('lobby:create', async () => {
    console.log('creating lobby...');

    // make sure we're not in a room already
    for (const room of socket.rooms) {
      if (room.startsWith('lobby-')) {
        socket.emit('client-error', 'Already in a lobby');
      }
    }

    const lobbyId: LobbyID = `lobby-${randomUUID()}`;
    const lobby = new Game(
      io,
      lobbyId,
      socket.id,
      socket.data.displayName || 'FIX ME',
      () => lobbies.delete(lobbyId),
    );
    lobbies.set(lobbyId, lobby);

    try {
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
      socket.emit('lobby:join', lobbyId, socket.id);
      console.log('lobby created!');
    } catch (err) {
      console.error(err);
      socket.emit('client-error', (err as Error).message);
    }

    console.log('lobbies:', lobbies.keys());
  });

  socket.on('lobby:join', (lobbyId) => {
    // make sure we're not in a room already
    for (const room of socket.rooms) {
      if (room.startsWith('lobby-')) {
        socket.emit('client-error', 'Already in a lobby');
        return false;
      }
    }

    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      socket.emit('client-error', 'Lobby not found');
      return false;
    }

    try {
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
      socket.emit('lobby:join', lobbyId, lobby.OwnerId);
    } catch (err) {
      socket.emit('client-error', (err as Error).message);
    }
  });

  socket.on('disconnect', async () => {
    if (!socket.data.lobbyId) return;

    const lobby = lobbies.get(socket.data.lobbyId);
    if (!lobby) return;

    try {
      lobby.removePlayer(socket.id);
    } catch (err) {
      console.error(
        'Something went wrong removing a disconnecting player from a game',
      );
    }
  });

  console.log('lobby handler registered!');
}
