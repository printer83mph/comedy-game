import { useEffect, useState } from 'react';

import type { LobbyID } from '../../../backend/src/types/server';
import socket from '../lib/socket';

export default function useLobbySocket() {
  const [connected, setConnected] = useState(socket.connected);
  const [lobby, setLobby] = useState<
    { lobbyId: null } | { lobbyId: LobbyID; players: [string, string][] }
  >({
    lobbyId: null,
  });

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onJoin(lobbyId: LobbyID) {
      console.log('joined lobby!', lobbyId);
      setLobby({ lobbyId, players: [] });
    }

    function onUpdatePlayers(players: [string, string][]) {
      if (lobby.lobbyId === null) return;
      setLobby((currentLobby) => ({ ...currentLobby, players }));
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('lobby:join', onJoin);
    socket.on('lobby:update-players', onUpdatePlayers);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('lobby:join', onJoin);
      socket.off('lobby:update-players', onUpdatePlayers);
      socket.off('disconnect', onDisconnect);
    };
  }, [lobby.lobbyId]);

  async function createLobby(nickname: string) {
    if (!connected) {
      return { error: 'Not connected' };
    }
    if (lobby.lobbyId) {
      return { error: 'Already in lobby' };
    }

    console.log('creating lobby...');
    socket.emitWithAck('lobby:create', nickname);
  }

  async function joinLobby(lobbyId: LobbyID) {
    if (!connected) {
      return { error: 'Not connected' };
    }

    socket.emit('lobby:join', lobbyId);

    return { error: undefined };
  }

  return { connected, lobby, createLobby, joinLobby };
}
