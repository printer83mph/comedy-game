import { NewGameState } from 'backend/src/types/server';
import { useEffect, useState } from 'react';

import socket from '../lib/socket';

export default function useGameSocket(/* {
  players,
}: {
  players: [string, string][];
} */) {
  const [gameState, setGameState] = useState<
    | { phase: 'playing'; state: NewGameState }
    | { phase: 'waiting' }
    | { phase: 'finished'; scores: [string, number][] }
  >({ phase: 'waiting' });

  useEffect(() => {
    function onConnect() {}

    function onSetState(newState: NewGameState) {
      setGameState({ phase: 'playing', state: newState });
    }

    function onFinish(scores: [string, number][]) {
      setGameState({ phase: 'finished', scores });
    }

    socket.on('connect', onConnect);
    socket.on('game:set-state', onSetState);
    socket.on('game:finish', onFinish);

    return () => {
      socket.off('connect', onConnect);
      socket.off('game:set-state', onSetState);
      socket.off('game:finish', onFinish);
    };
  });

  function startGame() {
    socket.emit('game:start');
  }

  function submitCaption(caption: string) {
    socket.emit('game:submit-caption', caption);
  }

  function submitVote(submissionPlayerId: string) {
    socket.emit('game:submit-vote', submissionPlayerId);
  }

  return { gameState, startGame, submitCaption, submitVote };
}
