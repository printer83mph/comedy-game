import { useEffect, useState } from 'react';

import { NewGameState } from '../../../backend/src/types/server';

import Timer from './timer';

const TIME_PER_CAPTION = 3;

export default function LookingStep({
  gameState,
  players,
}: {
  gameState: NewGameState;
  players: [string, string][];
}) {
  const [page, setPage] = useState<'captions' | 'winner'>('captions');

  useEffect(() => {
    if (gameState.state !== 'looking') return;
    const switchTime = gameState.captions.length * TIME_PER_CAPTION;

    const timeout = setTimeout(() => {
      setPage('winner');
    }, switchTime * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [gameState]);

  if (gameState.state !== 'looking') return null;

  return (
    <div>
      <img
        src={
          page === 'captions' ? '/answers_are_in.svg' : '/and_the_winner_is.svg'
        }
        className="w-full lg:h-[100px] lg:w-auto"
      />
      <Timer
        endTime={gameState.endTime}
        className="text-white/70 mt-4"
        postText="until next round"
      />
      {page === 'captions' && (
        <div className="flex flex-col lg:flex-row gap-8 lg:items-center mt-8">
          <div className="w-full lg:w-[650px]">
            <img
              src={gameState.imgUrl}
              className="aspect-square w-full object-cover rounded-xl mt-4"
            />
          </div>
          <ul className="space-y-6 text-2xl">
            {gameState.captions.map(([playerId, caption]) => {
              const playerName = players.find(([id]) => id === playerId)?.[1];
              return (
                <li key={playerId}>
                  <div className={`text-white`}>
                    {playerName ?? '(Player left game)'}
                  </div>
                  <div
                    className={`text-neutral-200 before:[content:'"'] after:[content:'"']`}
                  >
                    {caption}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {page === 'winner' && (
        <div className="flex flex-col items-center mt-8">
          <div className="w-full lg:w-[650px]">
            <img
              src={gameState.imgUrl}
              className="aspect-square w-full object-cover rounded-t-xl mt-4"
            />
            <ul className="bg-white rounded-b-2xl">
              {gameState.winners.map((winnerId) => {
                const playerName = players.find(([id]) => id === winnerId)?.[1];
                const caption = gameState.captions.find(
                  ([id]) => id === winnerId,
                )?.[1];
                return (
                  <li className="text-black/70 px-6 py-3">
                    <span className={``}>
                      {playerName ?? '(Player left game)'}
                    </span>{' '}
                    –{' '}
                    <span
                      className={`text-black before:[content:'"'] after:[content:'"']`}
                    >
                      {caption}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
