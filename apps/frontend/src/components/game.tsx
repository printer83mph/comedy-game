import type { LobbyID } from '../../../backend/src/types/server';
import useGameSocket from '../hooks/use-game-socket';
import socket from '../lib/socket';

export default function Game({
  lobbyId,
  players,
  ownerId,
}: {
  lobbyId: LobbyID;
  players: [string, string][];
  ownerId: string;
}) {
  const { gameState, startGame, submitCaption, submitVote } =
    useGameSocket(/* { players } */);

  const isOwner = ownerId === socket.id;
  const canStartGame = players.length >= 3;
  const isWriting = gameState?.state === 'writing';

  return (
    <main className="w-full h-screen">
      {gameState === null && (
        <>
          <h1 className="text-3xl font-bold">Welcome to Game</h1>
          <div>
            Players:{' '}
            <ul className="flex gap-3">
              {players.map(([, displayName]) => (
                <li>{displayName}</li>
              ))}
            </ul>
          </div>
          <h2 className="mt-8">{lobbyId}</h2>
          {isOwner && (
            <button
              disabled={!canStartGame}
              onClick={() => {
                startGame();
              }}
            >
              {canStartGame ? 'Start Game' : 'Waiting for Players'}
            </button>
          )}
        </>
      )}
      {gameState !== null && (
        <>{isWriting && <h1>Do your writing baby!!</h1>}</>
      )}
    </main>
  );
}
