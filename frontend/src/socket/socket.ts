import { io } from 'socket.io-client';
import { WS_URL } from '../config/env';

export const socket = io(WS_URL, {
  autoConnect: false,     // connect manually after we have a player token
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
})