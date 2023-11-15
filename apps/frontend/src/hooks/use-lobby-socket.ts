import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import socket from '../lib/socket';

export default function useLobbySocket() {
  const [connected, setConnected] = useState(socket.connected);
  const [lobby, setLobby] = useState<
    | { lobbyId: null }
    | { lobbyId: string; players: [string, string][]; ownerId: string }
  >({
    lobbyId: null,
  });

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onJoin(lobbyId: string) {
      console.log('joined lobby!', lobbyId);
      setLobby({ lobbyId, players: [], ownerId: '' });
    }

    function onUpdatePlayers(players: [string, string][], ownerId: string) {
      if (lobby.lobbyId === null) return;
      setLobby((currentLobby) => ({ ...currentLobby, players, ownerId }));
    }

    function onClientError(message: string) {
      toast.error(`${message}.`);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('lobby:join', onJoin);
    socket.on('lobby:update-players', onUpdatePlayers);
    socket.on('client-error', onClientError);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('lobby:join', onJoin);
      socket.off('lobby:update-players', onUpdatePlayers);
      socket.off('client-error', onClientError);
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

  async function joinLobby(lobbyId: string) {
    if (!connected) {
      return { error: 'Not connected' };
    }

    socket.emit('lobby:join', lobbyId);

    return { error: undefined };
  }

  function leaveLobby() {
    if (!connected) {
      return { error: 'Not connected' };
    }

    socket.emit('lobby:leave');
    setLobby({ lobbyId: null });

    return { error: undefined };
  }

  function setDisplayName(displayName: string) {
    if (!connected) {
      return { error: 'Not connected' };
    }

    socket.emit('lobby:set-display-name', displayName);

    return { error: undefined };
  }

  return {
    connected,
    lobby,
    createLobby,
    joinLobby,
    leaveLobby,
    setDisplayName,
  };
}
