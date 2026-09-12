import { useParams, Navigate } from 'react-router';
import { RoomLobby } from '@/components/room-lobby';

export function RoomLobbyPage() {
  const { code } = useParams<{ code: string }>();

  if (!code) {
    return <Navigate to="/join-room" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <RoomLobby code={code.toUpperCase()} />
    </div>
  );
}
