import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../../../backend/src/types/server';

const SOCKET_URI = import.meta.env.VITE_BACKEND_URL;

const socket = io(SOCKET_URI, { timeout: 2000, autoConnect: true }) as Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;
export default socket;
