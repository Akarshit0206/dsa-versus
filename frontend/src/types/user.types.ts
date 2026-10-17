import type { UserProfile } from '@/lib/api';

export interface UserStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  problemsSolved: number;
  totalTestCasesPassed: number;
}

export interface RecentMatchQuestion {
  _id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topics: string[];
}

export interface RecentMatch {
  id: string;
  opponent: {
    _id: string;
    username: string;
    avatar: string;
  };
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  myScore: number;
  opponentScore: number;
  timeTaken: number;
  duration: number;
  playedAt: string;
  questions: RecentMatchQuestion[];
}

export interface FriendUser {
  _id: string;
  username: string;
  avatar: string;
}

export interface PendingFriendRequest {
  friendshipId: string;
  from?: FriendUser;
  to?: FriendUser;
  createdAt: string;
}

export interface FullUserProfile {
  user: UserProfile;
  stats: UserStats;
  recentMatches: RecentMatch[];
  friends: FriendUser[];
  incomingRequests: PendingFriendRequest[];
  outgoingRequests: PendingFriendRequest[];
}
