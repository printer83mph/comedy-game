import type { Server, Socket } from 'socket.io';

export interface ServerToClientEvents {
  'client-error': (error: string) => void;
  'user:update-name': (newName: string) => void;
  'game:set-state': (
    newState:
      | { state: 'writing'; imgUrl: string }
      | { state: 'judging'; captions: { id: string; content: string } },
  ) => void;
  'game:finish': (scores: Map<string, number>) => void;
}

export interface ClientToServerEvents {
  'user:set-name': (newName: string) => void;
  'lobby:create': () => void;
  'lobby:join': (lobbyId: string) => void;
  'game:start': () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  displayName?: string;
  lobbyId?: string;
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
