import type { Server, Socket } from 'socket.io';

export type NewGameState = {
  roundIndex: number;
  imgUrl: string;
  endTime: number;
} & (
  | { state: 'writing' }
  | {
      state: 'judging';
      captions: [string, string][];
    }
  | {
      state: 'looking';
      captions: [string, string][];
      winners: string[];
    }
);

export interface ServerToClientEvents {
  'client-error': (error: string) => void;
  'lobby:join': (lobbyId: string, ownerId: string) => void;
  'lobby:update-players': (
    players: [string, string][],
    ownerId: string,
  ) => void;
  'game:set-state': (newState: NewGameState) => void;
  'game:finish': (scores: [string, number][]) => void;
}

export interface ClientToServerEvents {
  'lobby:set-display-name': (displayName: string) => void;
  'lobby:create': () => void;
  'lobby:join': (lobbyId: string) => void;
  'lobby:leave': () => void;
  'game:start': () => void;
  'game:submit-caption': (caption: string) => void;
  'game:submit-vote': (submissionPlayerId: string) => void;
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
