import toast from 'react-hot-toast';
import useGameSocket from '../hooks/use-game-socket';
import socket from '../lib/socket';

import JudgingStep from './judging-step';
import LookingStep from './looking-step';
import WritingStep from './writing-step';

export default function Game({
  lobbyId,
  players,
  ownerId,
}: {
  lobbyId: string;
  players: [string, string][];
  ownerId: string;
}) {
  const { gameState, startGame, submitCaption, submitVote } =
    useGameSocket(/* { players } */);

  const isOwner = ownerId === socket.id;
  const canStartGame = players.length >= 3;

  return (
    <main className="container mx-auto px-4 my-8">
      {gameState === null && (
        <>
          <img
            src="/waiting_for_players.svg"
            className="w-full lg:h-[100px] lg:w-auto"
          />
          <ul className="fixed left-0 bg-gradient-to-t from-theme-darkblue via-theme-darkblue/80 to-theme-darkblue/0 pt-6 right-0 bottom-0 flex flex-row justify-center gap-6 mx-6 max-h-[50vh]">
            {players.map(([id, displayName]) => (
              <li key={id} className="w-full max-w-[300px]">
                <div className="text-center text-xl text-white">
                  {displayName}
                </div>
                <img src="/player_indicator.svg" className="w-full mt-3" />
              </li>
            ))}
          </ul>
          <div className="text-center mt-12">
            <h2 className="mt-8 text-white/80 text-3xl select-none">
              Lobby Pin:{' '}
              <span className="select-text text-white">{lobbyId}</span>
            </h2>
            {isOwner && (
              <button
                disabled={!canStartGame}
                onClick={() => {
                  startGame();
                }}
                className="relative bg-white/90 rounded-2xl px-6 py-3 mt-8 enabled:bg-white enabled:hover:bg-white/90"
              >
                {canStartGame && (
                  <div className="absolute inset-0 bg-white animate-ping rounded-2xl" />
                )}
                <div className="relative">
                  {canStartGame
                    ? 'Start Game'
                    : 'At least 3 players are required to start.'}
                </div>
              </button>
            )}
          </div>
        </>
      )}
      {gameState !== null && (
        <>
          {gameState.state === 'writing' && (
            <WritingStep
              gameState={gameState}
              onSubmit={({ caption }) => {
                if (caption.length > 250) {
                  toast.error('Caption must be at most 250 characters!');
                  return;
                }
                submitCaption(caption);
              }}
            />
          )}
          {gameState.state === 'judging' && (
            <JudgingStep
              gameState={gameState}
              onVote={(submissionId) => {
                submitVote(submissionId);
              }}
            />
          )}
          {gameState.state === 'looking' && (
            <LookingStep gameState={gameState} players={players} />
          )}
        </>
      )}
    </main>
  );
}
