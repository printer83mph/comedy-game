import { CSSProperties } from 'react';
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
  leaveLobby,
}: {
  lobbyId: string;
  players: [string, string][];
  ownerId: string;
  leaveLobby: () => void;
}) {
  const { gameState, startGame, submitCaption, submitVote } =
    useGameSocket(/* { players } */);

  const isOwner = ownerId === socket.id;
  const canStartGame = players.length >= 3;

  const maxScore =
    gameState.phase === 'finished'
      ? gameState.scores.reduce((prev, [, score]) => Math.max(prev, score), 0)
      : 0;

  return (
    <main className="container mx-auto px-4 my-8">
      {gameState.phase === 'waiting' && (
        <>
          <img
            src="/img/waiting_for_players.svg"
            className="w-full lg:h-[100px] lg:w-auto"
          />
          <ul className="fixed left-0 bg-gradient-to-t from-theme-darkblue via-theme-darkblue/80 to-theme-darkblue/0 pt-6 right-0 bottom-0 flex flex-row justify-center gap-6 mx-6 max-h-[50vh]">
            {players.map(([id, displayName]) => (
              <li key={id} className="w-full max-w-[300px]">
                <div className="text-center text-xl text-white">
                  {displayName}
                </div>
                <img src="/img/player_indicator.svg" className="w-full mt-3" />
              </li>
            ))}
          </ul>
          <div className="text-center mt-12">
            <h2 className="mt-8 text-white/80 text-3xl select-none">
              Lobby Pin:{' '}
              <span className="select-text text-white">{lobbyId}</span>
            </h2>
            {isOwner && (
              <div className="relative mt-8 inline-block">
                {/* pinging div */}
                <div
                  className={`inset-0 bg-white animate-ping rounded-2xl ${
                    canStartGame ? 'absolute' : 'hidden'
                  }`}
                />
                {/* actual button */}
                <button
                  disabled={!canStartGame}
                  onClick={() => {
                    startGame();
                  }}
                  className="relative bg-white/90 rounded-2xl px-6 py-3 enabled:bg-white enabled:hover:bg-white/90"
                >
                  {canStartGame
                    ? 'Start Game'
                    : 'At least 3 players are required to start.'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {gameState.phase === 'playing' && (
        <>
          {gameState.state.state === 'writing' && (
            <WritingStep
              gameState={gameState.state}
              onSubmit={({ caption }) => {
                if (caption.length > 250) {
                  toast.error('Caption must be at most 250 characters!');
                  return;
                }
                submitCaption(caption);
              }}
            />
          )}
          {gameState.state.state === 'judging' && (
            <JudgingStep
              gameState={gameState.state}
              onVote={(submissionId) => {
                submitVote(submissionId);
              }}
            />
          )}
          {gameState.state.state === 'looking' && (
            <LookingStep gameState={gameState.state} players={players} />
          )}
        </>
      )}
      {gameState.phase === 'finished' && (
        <>
          <img
            src="/img/results.svg"
            className="w-full lg:h-[100px] lg:w-auto"
          />
          <h2 className="mt-8 text-white/80 text-3xl select-none text-center">
            Lobby Pin: <span className="select-text text-white">{lobbyId}</span>
          </h2>
          <div className="flex gap-4 justify-center">
            {isOwner && (
              <button
                type="button"
                className="px-6 py-3 bg-white/90 mt-6 rounded-2xl"
                onClick={() => {
                  startGame();
                }}
              >
                Play again
              </button>
            )}
            <button
              type="button"
              className="px-6 py-3 bg-white/90 mt-6 rounded-2xl"
              onClick={() => {
                leaveLobby();
              }}
            >
              Exit lobby
            </button>
          </div>
          <ul className="fixed max-h-[50vh] bottom-0 left-0 right-0 flex justify-center gap-6 bg-gradient-to-t from-theme-darkblue via-theme-darkblue/80 to-theme-darkblue/0">
            {gameState.scores.map(([playerId, score]) => {
              const playerName = players.find(([id]) => id === playerId)?.[1];
              return (
                <li
                  key={playerId}
                  className="w-full max-w-[300px] translate-y-[var(--score-translation)]"
                  style={
                    {
                      '--score-translation': `${
                        ((maxScore - score) / (maxScore || 1)) * 30
                      }%`,
                    } as CSSProperties
                  }
                >
                  <div className="text-center text-xl text-white">
                    {playerName} – {score}
                  </div>
                  <img
                    src="/img/player_indicator.svg"
                    className="w-full mt-3"
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
