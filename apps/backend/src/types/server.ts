import type { Server, Socket } from 'socket.io';

export type LobbyID = `lobby-${string}`;

export interface ServerToClientEvents {
  'client-error': (error: string) => void;
  'lobby:join': (lobbyId: LobbyID, ownerId: string) => void;
  'lobby:update-players': (players: [string, string][]) => void;
  'game:set-state': (
    newState:
      | { state: 'writing'; imgUrl: string }
      | { state: 'judging'; captions: { id: string; content: string } },
  ) => void;
  'game:finish': (scores: Map<string, number>) => void;
}

export interface ClientToServerEvents {
  'lobby:create': () => void;
  'lobby:join': (lobbyId: LobbyID) => void;
  'game:start': () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  displayName?: string;
  lobbyId?: LobbyID;
}

export type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type GameSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
