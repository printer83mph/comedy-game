import type { LobbyID } from '../../../backend/src/types/server';

export default function Game({ lobbyId }: { lobbyId: LobbyID }) {
  return (
    <main className="w-full h-screen bg-blue-200 flex items-center justify-center flex-col">
      <h1 className="text-3xl font-bold">Welcome to Game</h1>
      <h2 className="mt-8">{lobbyId}</h2>
    </main>
  );
}
