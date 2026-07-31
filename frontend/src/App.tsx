import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SiteLayout } from '@/components/layout/SiteLayout'
import { HomePage } from '@/pages/HomePage'
import { CreateRoomPage } from '@/pages/CreateRoomPage'
import { JoinRoomPage } from '@/pages/JoinRoomPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-room" element={<CreateRoomPage />} />
          <Route path="/join-room" element={<JoinRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
