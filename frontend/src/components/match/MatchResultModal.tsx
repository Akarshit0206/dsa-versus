import { useNavigate } from 'react-router';
import { Trophy, Frown, Equal, ArrowRight, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Match } from '@/types';

interface MatchResultModalProps {
  match: Match;
  currentUserId?: string;
  reason?: string;
  onClose?: () => void;
}

export function MatchResultModal({ match, currentUserId, reason, onClose }: MatchResultModalProps) {
  const navigate = useNavigate();

  const isPlayer1 = currentUserId === match.player1.userId;
  const isPlayer2 = currentUserId === match.player2.userId;

  const myStats = isPlayer1 ? match.player1Stats : match.player2Stats;
  const opponentStats = isPlayer1 ? match.player2Stats : match.player1Stats;
  const myPlayer = isPlayer1 ? match.player1 : match.player2;
  const opponentPlayer = isPlayer1 ? match.player2 : match.player1;

  // Outcome resolution
  const hasWinner = !!match.winner;
  const isWinner = hasWinner && currentUserId && match.winner === currentUserId;
  const isLoser = hasWinner && currentUserId && match.winner !== currentUserId;
  const isDraw = !hasWinner;

  let subtitleMessage = '';
  if (isWinner) {
    if (
      reason === 'OPPONENT_DISCONNECTED' ||
      reason === 'FORFEIT_PLAYER_LEFT' ||
      reason === 'FORFEIT'
    ) {
      subtitleMessage = `${opponentPlayer?.displayName || 'Your opponent'} left the match. You won by forfeit!`;
    } else {
      subtitleMessage = 'You conquered the algorithmic challenge and claimed victory!';
    }
  } else if (isLoser) {
    if (reason === 'FORFEIT_PLAYER_LEFT' || reason === 'FORFEIT') {
      subtitleMessage = 'You left the arena and forfeited the match.';
    } else if (reason === 'OPPONENT_DISCONNECTED') {
      subtitleMessage = 'Match ended due to player disconnection.';
    } else {
      subtitleMessage = 'An honorable clash. Review your mistakes and queue again.';
    }
  } else {
    subtitleMessage = 'Both duelists finished with identical performance.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl text-ink">
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center">
          {isWinner && (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/10 animate-bounce">
              <Trophy className="size-8" />
            </div>
          )}
          {isLoser && (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/10">
              <Frown className="size-8" />
            </div>
          )}
          {isDraw && (
            <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-8 ring-blue-500/10">
              <Equal className="size-8" />
            </div>
          )}

          <h2 className="mt-4 text-2xl font-black tracking-tight">
            {isWinner && 'Victory! You Won!'}
            {isLoser && 'Defeat! Better Luck Next Time'}
            {isDraw && 'Match Draw! Evenly Matched'}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {subtitleMessage}
          </p>
        </div>

        {/* Duelists Head-to-Head Comparison */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border/80 bg-background/50 p-4">
          {/* Current User */}
          <div
            className={cn(
              'flex flex-col items-center rounded-lg p-3 text-center border',
              isWinner
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-border/60 bg-card/60'
            )}
          >
            <span className="text-xs font-semibold text-muted-foreground">You</span>
            <span className="mt-1 font-bold text-ink truncate max-w-[120px]">
              {myPlayer?.displayName || 'You'}
            </span>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>{myStats?.totalTestCasesPassed || 0} Testcases</span>
            </div>
            {myStats?.timeTaken !== undefined && myStats.timeTaken > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{myStats.timeTaken}s elapsed</span>
              </div>
            )}
          </div>

          {/* Opponent */}
          <div
            className={cn(
              'flex flex-col items-center rounded-lg p-3 text-center border',
              isLoser
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-border/60 bg-card/60'
            )}
          >
            <span className="text-xs font-semibold text-muted-foreground">Opponent</span>
            <span className="mt-1 font-bold text-ink truncate max-w-[120px]">
              {opponentPlayer?.displayName || 'Opponent'}
            </span>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>{opponentStats?.totalTestCasesPassed || 0} Testcases</span>
            </div>
            {opponentStats?.timeTaken !== undefined && opponentStats.timeTaken > 0 && (
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{opponentStats.timeTaken}s elapsed</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-98"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="size-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-muted-foreground hover:text-ink hover:bg-secondary transition-colors"
            >
              <RotateCcw className="size-4" />
              <span>Review Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
