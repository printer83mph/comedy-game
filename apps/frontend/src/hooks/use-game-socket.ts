import { useEffect, useState } from 'react';

import { NewGameState } from '../../../backend/src/types/server';
import socket from '../lib/socket';

export default function useGameSocket(/* {
  players,
}: {
  players: [string, string][];
} */) {
  const [gameState, setGameState] = useState<NewGameState | null>(null);

  useEffect(() => {
    function onConnect() {}
    function onSetState(newState: NewGameState) {
      setGameState(newState);
    }

    socket.on('connect', onConnect);
    socket.on('game:set-state', onSetState);

    return () => {
      socket.off('connect', onConnect);
      socket.off('game:set-state', onSetState);
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
