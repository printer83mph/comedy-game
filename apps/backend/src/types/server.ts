import type { Server, Socket } from 'socket.io';

export type LobbyID = `lobby-${string}`;

export type NewGameState = {
  roundIndex: number;
  imgUrl: string;
  endTime: number;
} & (
  | { state: 'writing' }
  | {
      state: 'judging';
      captions: { id: string; content: string };
    }
);

export interface ServerToClientEvents {
  'client-error': (error: string) => void;
  'lobby:join': (lobbyId: LobbyID, ownerId: string) => void;
  'lobby:update-players': (
    players: [string, string][],
    ownerId: string,
  ) => void;
  'game:set-state': (newState: NewGameState) => void;
  'game:finish': (scores: Map<string, number>) => void;
}

export interface ClientToServerEvents {
  'lobby:create': () => void;
  'lobby:join': (lobbyId: LobbyID) => void;
  'game:start': () => void;
  'game:submit-caption': (caption: string) => void;
  'game:submit-vote': (submissionPlayerId: string) => void;
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
