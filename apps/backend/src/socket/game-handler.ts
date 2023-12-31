import type Game from '../lib/game';
import { GameServer, GameSocket } from '../types/server';

import { getLobby } from './lobby-handler';

function withLobby<TParams extends unknown[]>(
  handler: (game: Game, ...args: TParams) => void,
  socket: GameSocket,
) {
  return function handlerWithLobby(...args: TParams) {
    if (!socket.data.lobbyId) return;
    const game = getLobby(socket.data.lobbyId);
    if (!game) return;
    handler(game, ...args);
  };
}

export default function registerGameHandler(
  io: GameServer,
  socket: GameSocket,
) {
  socket.on(
    'game:start',
    withLobby((game) => {
      if (game.OwnerId !== socket.id) {
        console.log('Non-owner attempted game start');
        return;
      }
      try {
        console.log('Starting game!');
        game.play();
      } catch (err) {
        console.error(err);
        socket.emit('client-error', (err as Error).message);
      }
    }, socket),
  );

  socket.on(
    'game:submit-caption',
    withLobby((game, caption) => {
      try {
        game.submitCaption(socket.id, caption);
      } catch (err) {
        console.error(err);
        socket.emit('client-error', (err as Error).message);
      }
    }, socket),
  );

  socket.on(
    'game:submit-vote',
    withLobby((game, submissionPlayerId) => {
      try {
        game.submitVote(socket.id, submissionPlayerId);
      } catch (err) {
        console.error(err);
        socket.emit('client-error', (err as Error).message);
      }
    }, socket),
  );
}
