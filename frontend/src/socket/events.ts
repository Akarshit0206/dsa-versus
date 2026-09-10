export type RoomFormat = "blitz" | "standard" | "classic" | "custom";

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
}

export interface SocketResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}