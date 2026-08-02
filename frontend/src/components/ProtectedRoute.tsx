import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-marker" />
        <p className="text-sm font-medium text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
        state={{ message: 'Please sign in to create or join a room.' }}
        replace
      />
    )
  }

  return <>{children}</>
}
