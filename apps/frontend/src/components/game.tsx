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
  const { gameState, startGame, submitCaption } =
    useGameSocket(/* { players } */);

  const isOwner = ownerId === socket.id;
  const isWriting = gameState?.state === 'writing';

  return (
    <main className="w-full h-screen bg-blue-200 flex items-center justify-center flex-col">
      {gameState === null && (
        <>
          <h1 className="text-3xl font-bold">Welcome to Game</h1>
          <h2 className="mt-8">{lobbyId}</h2>
          {isOwner && (
            <button
              onClick={() => {
                startGame();
              }}
            >
              Start Game
            </button>
          )}
        </>
      )}
      {gameState !== null && (
        <>
          <div>Players: {players.map(([, displayName]) => displayName)}</div>
          {isWriting && <h1>Do your writing baby!!</h1>}
        </>
      )}
    </main>
  );
}
