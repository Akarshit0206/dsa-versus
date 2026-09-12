import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import type {
  Match,
  PlayerStats,
  UpdateProgressInput,
  SocketResponse,
} from '@/types';

export function useMatchSocket(initialMatch?: Match | null) {
  const { socket, isConnected } = useSocket();
  const [match, setMatch] = useState<Match | null>(initialMatch || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [winnerUserId, setWinnerUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMatch) {
      setMatch(initialMatch);
    }
  }, [initialMatch]);

  useEffect(() => {
    function handleProgressUpdated(payload: {
      matchId: string;
      player1Stats: PlayerStats;
      player2Stats: PlayerStats;
    }) {
      setMatch((prev) => {
        if (!prev || prev.matchId !== payload.matchId) return prev;
        return {
          ...prev,
          player1Stats: payload.player1Stats,
          player2Stats: payload.player2Stats,
        };
      });
    }

    function handleMatchEnded(payload: { matchId: string; winnerUserId?: string }) {
      setMatch((prev) => {
        if (!prev || prev.matchId !== payload.matchId) return prev;
        return {
          ...prev,
          status: 'completed',
          winner: payload.winnerUserId || null,
        };
      });
      if (payload.winnerUserId) {
        setWinnerUserId(payload.winnerUserId);
      }
    }

    function handlePlayerDisconnected(payload: { userId: string }) {
      if (import.meta.env.DEV) {
        console.log('Opponent temporarily disconnected:', payload.userId);
      }
    }

    socket.on('match:progress_updated', handleProgressUpdated);
    socket.on('match:ended', handleMatchEnded);
    socket.on('match:player_disconnected', handlePlayerDisconnected);

    return () => {
      socket.off('match:progress_updated', handleProgressUpdated);
      socket.off('match:ended', handleMatchEnded);
      socket.off('match:player_disconnected', handlePlayerDisconnected);
    };
  }, [socket]);

  /**
   * Fetch match details by ID (hydrates on reload or direct visit)
   */
  const getMatch = useCallback(
    (matchId: string): Promise<Match> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);
        setError(null);

        socket.emit('match:get', { matchId }, (response: SocketResponse<Match>) => {
          setIsLoading(false);
          if (response.success && response.data) {
            setMatch(response.data);
            resolve(response.data);
          } else {
            const errMsg = response.error || 'Failed to load match.';
            setError(errMsg);
            reject(new Error(errMsg));
          }
        });
      });
    },
    [socket]
  );

  const updateProgress = useCallback(
    (input: UpdateProgressInput): Promise<Match> => {
      return new Promise((resolve, reject) => {
        setIsSubmitting(true);
        setError(null);

        socket.emit('match:update_progress', input, (response: SocketResponse<Match>) => {
          setIsSubmitting(false);
          if (response.success && response.data) {
            setMatch(response.data);
            resolve(response.data);
          } else {
            const errMsg = response.error || 'Failed to update progress.';
            setError(errMsg);
            reject(new Error(errMsg));
          }
        });
      });
    },
    [socket]
  );

  return {
    isConnected,
    match,
    isLoading,
    isSubmitting,
    winnerUserId,
    error,
    getMatch,
    updateProgress,
    setMatch,
  };
}
