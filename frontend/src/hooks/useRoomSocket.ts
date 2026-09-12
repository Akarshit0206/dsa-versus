import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import type {
  Room,
  CreateRoomPayload,
  Match,
  SocketResponse,
} from '@/types';

export function useRoomSocket() {
  const { socket, isConnected } = useSocket();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [disbandedReason, setDisbandedReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Set up socket listeners for real-time room & match transitions
  useEffect(() => {
    function handleRoomUpdated(updatedRoom: Room) {
      setCurrentRoom(updatedRoom);
      setError(null);
      setDisbandedReason(null);
    }

    function handleMatchStarted({ match }: { match: Match }) {
      setActiveMatch(match);
      setCurrentRoom((prev) => (prev ? { ...prev, status: 'active' } : null));
    }

    function handleRoomDeleted({ message }: { message: string }) {
      setDisbandedReason(message || 'The host has left the room. Room disbanded.');
      setCurrentRoom(null);
      setActiveMatch(null);
    }

    socket.on('room:updated', handleRoomUpdated);
    socket.on('match:started', handleMatchStarted);
    socket.on('room:deleted', handleRoomDeleted);

    return () => {
      socket.off('room:updated', handleRoomUpdated);
      socket.off('match:started', handleMatchStarted);
      socket.off('room:deleted', handleRoomDeleted);
    };
  }, [socket]);

  /**
   * Create a new room
   */
  const createRoom = useCallback(
    (payload: CreateRoomPayload): Promise<Room> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);
        setError(null);

        socket.emit('room:create', payload, (response: SocketResponse<Room>) => {
          setIsLoading(false);
          if (response.success && response.data) {
            setCurrentRoom(response.data);
            resolve(response.data);
          } else {
            const errMsg = response.error || 'Failed to create room.';
            setError(errMsg);
            reject(new Error(errMsg));
          }
        });
      });
    },
    [socket]
  );

  /**
   * Join an existing room via 6-digit code
   */
  const joinRoom = useCallback(
    (code: string, displayName?: string): Promise<Room> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);
        setError(null);

        socket.emit(
          'room:join',
          { code, displayName },
          (response: SocketResponse<Room>) => {
            setIsLoading(false);
            if (response.success && response.data) {
              setCurrentRoom(response.data);
              resolve(response.data);
            } else {
              const errMsg = response.error || 'Failed to join room.';
              setError(errMsg);
              reject(new Error(errMsg));
            }
          }
        );
      });
    },
    [socket]
  );

  /**
   * Fetch room details (for hydration in /room/:code)
   */
  const getRoom = useCallback(
    (code: string): Promise<Room> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);
        setError(null);

        socket.emit('room:get', { code }, (response: SocketResponse<Room>) => {
          setIsLoading(false);
          if (response.success && response.data) {
            setCurrentRoom(response.data);
            resolve(response.data);
          } else {
            const errMsg = response.error || 'Room not found.';
            setError(errMsg);
            reject(new Error(errMsg));
          }
        });
      });
    },
    [socket]
  );

  /**
   * Start match (Host only)
   */
  const startMatch = useCallback(
    (code: string): Promise<Match> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);
        setError(null);

        socket.emit('match:start', { code }, (response: SocketResponse<Match>) => {
          setIsLoading(false);
          if (response.success && response.data) {
            setActiveMatch(response.data);
            resolve(response.data);
          } else {
            const errMsg = response.error || 'Failed to start match.';
            setError(errMsg);
            reject(new Error(errMsg));
          }
        });
      });
    },
    [socket]
  );

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(
    (code: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        setIsLoading(true);

        socket.emit('room:leave', { code }, (response: SocketResponse) => {
          setIsLoading(false);
          setCurrentRoom(null);
          setActiveMatch(null);
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to leave room.'));
          }
        });
      });
    },
    [socket]
  );

  return {
    isConnected,
    currentRoom,
    activeMatch,
    isLoading,
    disbandedReason,
    error,
    createRoom,
    joinRoom,
    getRoom,
    startMatch,
    leaveRoom,
    setCurrentRoom,
    setError,
  };
}
