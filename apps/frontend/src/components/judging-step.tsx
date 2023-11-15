import { useState } from 'react';
import toast from 'react-hot-toast';

import { NewGameState } from '../../../backend/src/types/server';
import socket from '../lib/socket';

import Timer from './timer';

export default function JudgingStep({
  gameState,
  onVote,
}: {
  gameState: NewGameState;
  onVote: (submissionId: string) => void;
}) {
  const [selected, setSelected] = useState('');
  const [voted, setVoted] = useState(false);

  if (gameState.state === 'writing') return null;
  return (
    <>
      <img src="/vote.svg" className="w-full lg:h-[100px] lg:w-auto" />
      {voted ? (
        <div className="flex h-[540px] flex-col items-center justify-center text-white animate-pulse text-3xl">
          Waiting for other players...
        </div>
      ) : (
        <div className="mt-8">
          <Timer
            endTime={gameState.endTime}
            className="text-white animate-pulse"
          />
          <div className="lg:flex-row lg:justify-between flex flex-col gap-8">
            <div className="w-full lg:w-[650px]">
              <img
                src={gameState.imgUrl}
                className="aspect-square w-full object-cover rounded-xl mt-4"
              />
            </div>
            <div>
              <ul className="mt-4 flex flex-col items-end gap-4">
                {gameState.captions.map(([playerId, caption]) => (
                  <li key={playerId}>
                    <button
                      onClick={
                        playerId === socket.id
                          ? () => {
                              toast.error("You can't vote for yourself man...");
                            }
                          : () => {
                              setSelected((s) =>
                                s === playerId ? '' : playerId,
                              );
                            }
                      }
                      className={`px-6 py-3 rounded-full transition-colors ${
                        selected === playerId ? 'bg-white' : 'bg-white/70'
                      }`}
                    >
                      {caption}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={selected === ''}
                onClick={() => {
                  setVoted(true);
                  onVote(selected);
                }}
                className="px-6 py-3 bg-yellow-100 rounded-2xl mt-12"
              >
                Go!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
