import type { RoomPlayer } from './room.types';

export interface QuestionProgress {
  question: string;
  totalTestCases: number;
  testCasesPassed: number;
  attemptsCount: number;
  bestSubmissionId?: string;
  completedAt?: string | Date | null;
}

export interface PlayerStats {
  player: string;
  questionProgress: QuestionProgress[];
  totalTestCasesPassed: number;
  timeTaken: number;
}

export interface PublicTestCase {
  input: string;
  output: string;
  isSample: boolean;
}

export interface PublicQuestion {
  _id: string;
  title: string;
  slug?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  constraints: string[];
  topics: string[];
  starterCode?: Record<string, string>;
  testCases: PublicTestCase[];
}

export interface Match {
  matchId: string;
  roomCode: string;
  player1: RoomPlayer;
  player2: RoomPlayer;
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  questions: string[];
  questionsData?: PublicQuestion[];
  durationInMinutes: number;
  startedAt: string | Date;
  endedAt?: string | Date | null;
  winner?: string | null;
  status: 'in_progress' | 'completed';
}

export interface UpdateProgressInput {
  matchId: string;
  userId: string;
  questionId: string;
  testCasesPassed: number;
  totalTestCases: number;
}
