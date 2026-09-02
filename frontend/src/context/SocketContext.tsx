import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react'
import { Socket } from 'socket.io-client'
import { socket } from '@/socket/socket'
import { useAuth } from '@/context/AuthContext'

interface SocketContextType {
  socket: Socket
  isConnected: boolean
  socketId: string | null
  connectionError: string | null
  reconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected)
  const [socketId, setSocketId] = useState<string | null>(socket.id || null)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // 1. Global Socket Lifecycle Listeners (Runs ONCE on mount)
  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      setSocketId(socket.id || null)
      setConnectionError(null)
      if (import.meta.env.DEV) {
        console.log('⚡ Socket connected globally:', socket.id)
      }
    }

    function onDisconnect(reason: Socket.DisconnectReason) {
      setIsConnected(false)
      setSocketId(null)
      if (import.meta.env.DEV) {
        console.log('🔌 Socket disconnected:', reason)
      }
    }

    function onConnectError(error: Error) {
      setConnectionError(error.message)
      if (import.meta.env.DEV) {
        console.error('⚠️ Socket connection error:', error.message)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)

    // Sync initial state if socket was already connected
    if (socket.connected) {
      setIsConnected(true)
      setSocketId(socket.id || null)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [])

  // 2. Auth & Connection Management (Runs when user or loading state changes)
  useEffect(() => {
    // Wait until AuthContext finishes checking /api/auth/me
    if (loading) return

    if (user) {
      socket.auth = {
        userId: user._id,
        username: user.username,
      }

      if (!socket.connected) {
        socket.connect()
      }
    } else {
      // User logged out: disconnect socket and reset state
      if (socket.connected) {
        socket.disconnect()
      }
      setIsConnected(false)
      setSocketId(null)
      setConnectionError(null)
    }
  }, [user?._id, loading])

  // Helper function exposed to UI for manual retry if connection fails
  const reconnect = () => {
    if (!user) return
    setConnectionError(null)
    socket.disconnect().connect()
  }

  const value = useMemo(
    () => ({ socket, isConnected, socketId, connectionError, reconnect }),
    [isConnected, socketId, connectionError]
  )

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}