import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiRequest, ApiErrorResponse, type UserProfile } from '@/lib/api'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (identifier: string, password: string) => Promise<UserProfile>
  register: (username: string, email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'algoduel_user_session'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInitialUser() {
      try {
        const res = await apiRequest<UserProfile>('/api/auth/me', { method: 'GET' })
        if (res.data) {
          setUser(res.data)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data))
        }
      } catch {
        // If server is unavailable or session cookie expired, check local backup session
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialUser()
  }, [])

  async function login(identifier: string, password: string): Promise<UserProfile> {
    try {
      const res = await apiRequest<{ user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      })
      const loggedInUser = res.data.user
      setUser(loggedInUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
      return loggedInUser
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Fallback for standalone frontend dev if backend server is offline
        const mockUser: UserProfile = {
          _id: 'user_' + Date.now(),
          username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
          avatar: '',
        }
        setUser(mockUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
        return mockUser
      }
      throw error
    }
  }

  async function register(username: string, email: string, password: string): Promise<UserProfile> {
    try {
      const res = await apiRequest<UserProfile>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      })
      
      // Auto-login after successful registration
      return await login(username, password)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Fallback for standalone frontend dev if backend server is offline
        const mockUser: UserProfile = {
          _id: 'user_' + Date.now(),
          username: username.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          avatar: '',
        }
        setUser(mockUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
        return mockUser
      }
      throw error
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
