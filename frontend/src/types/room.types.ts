export type RoomFormat = 'blitz' | 'standard' | 'classic' | 'custom';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemRequirement {
  difficulty: Difficulty;
  count: number;
}

export interface RoomConfig {
  format: RoomFormat;
  topics: string[];
  timeLimitInMinutes: number;
  problemRequirements: ProblemRequirement[];
}

export interface CustomRoomConfig {
  duration: number; // Must be between 10 and 60 minutes
  easyCount?: number;
  mediumCount?: number;
  hardCount?: number;
}

export interface CreateRoomPayload {
  format: RoomFormat;
  topics: string[];
  customConfig?: CustomRoomConfig;
  displayName?: string;
}

export interface RoomPlayer {
  userId: string;
  displayName: string;
  socketId: string;
  isConnected: boolean;
}

export interface Room {
  code: string;
  host: RoomPlayer;
  guest?: RoomPlayer | null;
  status: 'waiting' | 'active' | 'completed';
  config: RoomConfig;
  createdAt: string | Date;
  expiresAt: string | Date;
}
