import type { Room, CreateRoomPayload } from './room.types';
import type { Match, PlayerStats, UpdateProgressInput } from './match.types';

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ClientToServerEvents {
  'room:create': (payload: CreateRoomPayload, ack: (res: SocketResponse<Room>) => void) => void;
  'room:join': (payload: { code: string; displayName?: string }, ack: (res: SocketResponse<Room>) => void) => void;
  'room:leave': (payload: { code: string }, ack: (res: SocketResponse<{ action: string }>) => void) => void;
  'match:get': (payload: { matchId: string }, ack: (res: SocketResponse<Match>) => void) => void;
  'match:update_progress': (payload: UpdateProgressInput, ack?: (res: SocketResponse<Match>) => void) => void;
  'match:reconnect': (payload: { matchId: string }, ack: (res: SocketResponse<Match>) => void) => void;
}

export interface ServerToClientEvents {
  'room:updated': (room: Room) => void;
  'match:started': (payload: { match: Match }) => void;
  'match:progress_updated': (payload: { matchId: string; player1Stats: PlayerStats; player2Stats: PlayerStats }) => void;
  'match:ended': (payload: { matchId: string; winnerUserId?: string }) => void;
  'match:player_disconnected': (payload: { userId: string }) => void;
}
