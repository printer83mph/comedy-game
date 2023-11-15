import randomstring from 'randomstring';

import Game from '../lib/game';
import { GameServer, GameSocket } from '../types/server';

const lobbies = new Map<string, Game>();

export function getLobby(lobbyId: string) {
  return lobbies.get(lobbyId);
}

function updatePlayers(io: GameServer, lobbyId: string) {
  const game = lobbies.get(lobbyId)!;
  io.to(lobbyId).emit(
    'lobby:update-players',
    game.Players.map(([id, { nickname }]) => [id, nickname]),
    game.OwnerId,
  );
}

export default function registerLobbyHandler(
  io: GameServer,
  socket: GameSocket,
) {
  socket.on('lobby:set-display-name', (displayName) => {
    socket.data.displayName = displayName.substring(0, 32);
  });

  socket.on('lobby:create', async () => {
    console.log('creating lobby...');

    // make sure we're not in a room already
    if (socket.data.lobbyId) {
      console.error('Client already in a lobby');
      socket.emit('client-error', 'Already in a lobby');
      return;
    }

    const lobbyId: string = randomstring.generate({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      charset: ['ABC', 'numeric'],
      length: 4,
    });
    const game = new Game(
      io,
      lobbyId,
      socket.id,
      socket.data.displayName || 'Anonymous',
      () => lobbies.delete(lobbyId),
    );
    lobbies.set(lobbyId, game);

    try {
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
      socket.emit('lobby:join', lobbyId, socket.id);
      updatePlayers(io, lobbyId);
      console.log('lobby created!');
    } catch (err) {
      console.error(err);
      socket.emit('client-error', (err as Error).message);
    }

    console.log('lobbies:', lobbies.keys());
  });

  socket.on('lobby:join', (lobbyId) => {
    // make sure we're not in a room already
    if (socket.data.lobbyId) {
      console.error('Client already in a lobby');
      socket.emit('client-error', 'Already in a lobby');
      return;
    }

    const game = lobbies.get(lobbyId);
    if (!game) {
      socket.emit('client-error', 'Lobby not found');
      return;
    }

    try {
      game.addPlayer(socket.id, socket.data.displayName || 'Anonymous');
      socket.join(lobbyId);
      socket.data.lobbyId = lobbyId;
      socket.emit('lobby:join', lobbyId, game.OwnerId);
      updatePlayers(io, lobbyId);
    } catch (err) {
      socket.emit('client-error', (err as Error).message);
    }
  });

  socket.on('lobby:leave', () => {
    if (!socket.data.lobbyId) {
      console.error('Client not in a lobby');
      socket.emit('client-error', 'Not in a lobby');
      return;
    }

    const game = lobbies.get(socket.data.lobbyId);
    game?.removePlayer(socket.id);
    socket.leave(socket.data.lobbyId);
    socket.data.lobbyId = undefined;
  });

  socket.on('disconnect', async () => {
    if (!socket.data.lobbyId) return;

    const game = lobbies.get(socket.data.lobbyId);
    if (!game) return;

    try {
      game.removePlayer(socket.id);
      updatePlayers(io, socket.data.lobbyId);
    } catch (err) {
      console.error(
        'Something went wrong removing a disconnecting player from a game',
      );
    }
  });

  console.log('lobby handler registered!');
}
