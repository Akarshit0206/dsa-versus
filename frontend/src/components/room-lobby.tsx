import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Copy,
  Check,
  Play,
  LogOut,
  Users,
  Clock,
  Code2,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoomSocket } from '@/hooks/useRoomSocket';
import { DoodleBackdrop } from '@/components/doodle-backdrop';
import { cn } from '@/lib/utils';
import type { Room } from '@/types';

interface RoomLobbyProps {
  code: string;
}

export function RoomLobby({ code }: RoomLobbyProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentRoom,
    activeMatch,
    isLoading,
    disbandedReason,
    error,
    getRoom,
    startMatch,
    leaveRoom,
  } = useRoomSocket();

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Fetch room state on mount if not already populated (and room wasn't disbanded)
  useEffect(() => {
    if (disbandedReason) return;
    if (!currentRoom || currentRoom.code !== code) {
      getRoom(code).catch(() => {
        // Handled by hook error state
      });
    }
  }, [code, currentRoom, getRoom, disbandedReason]);

  // When match starts, navigate both players to the match arena
  useEffect(() => {
    if (activeMatch) {
      navigate(`/match/${activeMatch.matchId}`);
    }
  }, [activeMatch, navigate]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleStartMatch = async () => {
    if (!currentRoom?.guest) return;
    try {
      setIsStarting(true);
      setStartError(null);
      const match = await startMatch(code);
      navigate(`/match/${match.matchId}`);
    } catch (err: any) {
      setIsStarting(false);
      setStartError(err.message || 'Failed to start match.');
    }
  };

  const handleLeaveLobby = async () => {
    try {
      await leaveRoom(code);
    } finally {
      navigate('/');
    }
  };

  if (isLoading && !currentRoom) {
    return (
      <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-xl p-8 text-center">
        <Loader2 className="size-8 animate-spin text-marker" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Connecting to lobby {code}...</p>
      </div>
    );
  }

  // 1. Host left / room disbanded view
  if (disbandedReason) {
    return (
      <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-xl p-8 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
        <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <LogOut className="size-7" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-ink">Host Left the Room</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {disbandedReason}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Return Home
        </button>
      </div>
    );
  }

  // 2. Room load error view
  if (error && !currentRoom) {
    const isNotFound = error === 'ROOM_NOT_FOUND';
    return (
      <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-xl p-8 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-7" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-ink">
          {isNotFound ? 'Room Not Found' : 'Unable to Load Room'}
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {isNotFound
            ? `Room ${code} does not exist, has already started, or has expired.`
            : error}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (!currentRoom) return null;

  const isHost =
    user?._id === currentRoom.host.userId ||
    user?.username === currentRoom.host.displayName;

  const hasGuest = Boolean(currentRoom.guest);

  const displayTopics =
    !currentRoom.config.topics || currentRoom.config.topics.length === 0
      ? 'All Topics (Random)'
      : currentRoom.config.topics.join(', ');

  const totalQuestions = currentRoom.config.problemRequirements.reduce(
    (acc, req) => acc + req.count,
    0
  );

  return (
    <div className="glass-strong group relative isolate overflow-hidden rounded-xl p-7 sm:p-10">
      <DoodleBackdrop
        src="/doodles/swords.png"
        className="-right-10 -top-8 -z-10 h-44 w-44"
        tilt="12deg"
        opacity="opacity-[0.08]"
      />

      {/* Header & Status Indicator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'size-2.5 rounded-full motion-safe:animate-pulse',
                hasGuest ? 'bg-emerald-500' : 'bg-amber-500'
              )}
            />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {hasGuest ? 'Both Players Ready' : 'Waiting for Opponent'}
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Match Lobby
          </h2>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-1.5 pl-4 backdrop-blur-xs">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Room Code
            </p>
            <p className="font-mono text-xl font-black tracking-widest text-ink">
              {currentRoom.code}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="glass flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:border-marker/50 hover:bg-secondary"
            title="Copy Code"
          >
            {copied ? (
              <Check className="size-4 text-emerald-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Dual Player Matchup Section */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Player 1: Host Card */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-background/50 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              Host
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary font-mono text-lg font-bold text-ink">
              {currentRoom.host.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-ink">{currentRoom.host.displayName}</p>
              <p className="text-xs text-muted-foreground">
                {isHost ? 'You (Room Creator)' : 'Host Player'}
              </p>
            </div>
          </div>
        </div>

        {/* Player 2: Guest Card */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border p-5 transition-colors duration-300',
            hasGuest
              ? 'border-border bg-background/50'
              : 'border-dashed border-border/80 bg-background/20'
          )}
        >
          {hasGuest && currentRoom.guest ? (
            <>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-ink">
                  Challenger
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary font-mono text-lg font-bold text-ink">
                  {currentRoom.guest.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-ink">{currentRoom.guest.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {!isHost ? 'You (Challenger)' : 'Challenger Player'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-4 text-center">
              <Users className="size-8 text-muted-foreground/60 motion-safe:animate-pulse" />
              <p className="mt-2 text-sm font-semibold text-ink">Waiting for challenger...</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Share code <span className="font-mono font-bold text-ink">{currentRoom.code}</span> to join
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Match Configuration Details */}
      <div className="mt-6 rounded-xl border border-border bg-background/40 p-4">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-marker" />
          Duel Parameters
        </h4>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="flex items-center gap-2.5 text-ink">
            <Clock className="size-4 text-muted-foreground" />
            <span>Time Limit: <strong>{currentRoom.config.timeLimitInMinutes} mins</strong></span>
          </div>
          <div className="flex items-center gap-2.5 text-ink">
            <Code2 className="size-4 text-muted-foreground" />
            <span>Problems: <strong>{totalQuestions} questions</strong> ({currentRoom.config.format})</span>
          </div>
          <div className="flex items-center gap-2.5 text-ink">
            <Users className="size-4 text-muted-foreground" />
            <span className="truncate">Topics: <strong>{displayTopics}</strong></span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {startError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-in fade-in">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{startError}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleLeaveLobby}
          className="glass inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Leave Lobby
        </button>

        {isHost ? (
          <button
            type="button"
            disabled={!hasGuest || isStarting}
            onClick={handleStartMatch}
            className={cn(
              'inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 text-sm font-bold text-primary-foreground shadow-sm transition-[transform,opacity] duration-200',
              hasGuest
                ? 'bg-primary hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0'
                : 'bg-muted-foreground/30 opacity-60 cursor-not-allowed'
            )}
          >
            {isStarting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initializing Match...
              </>
            ) : (
              <>
                <Play className="size-4 fill-current" />
                {hasGuest ? 'Start Match' : 'Waiting for Opponent'}
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-5 py-3 text-xs font-semibold text-ink">
            <Loader2 className="size-4 animate-spin text-marker" />
            <span>Waiting for host to launch the duel...</span>
          </div>
        )}
      </div>
    </div>
  );
}
