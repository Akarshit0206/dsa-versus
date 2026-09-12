import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { HomePage } from '@/pages/HomePage'
import { CreateRoomPage } from '@/pages/CreateRoomPage'
import { JoinRoomPage } from '@/pages/JoinRoomPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { RoomLobbyPage } from '@/pages/RoomLobbyPage'
import { MatchPage } from '@/pages/MatchPage'

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/create-room"
              element={
                <ProtectedRoute>
                  <CreateRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-room"
              element={
                <ProtectedRoute>
                  <JoinRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:code"
              element={
                <ProtectedRoute>
                  <RoomLobbyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:matchId"
              element={
                <ProtectedRoute>
                  <MatchPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  )
}
