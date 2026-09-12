import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Clock,
  Play,
  Send,
  LogOut,
  Swords,
  CheckCircle2,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { Match, PublicQuestion } from '@/types';

interface MatchHeaderProps {
  match: Match;
  questions: PublicQuestion[];
  activeQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}

export function MatchHeader({
  match,
  questions,
  activeQuestionIndex,
  onSelectQuestion,
  onRunCode,
  onSubmitCode,
  isRunning,
  isSubmitting,
}: MatchHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Timer countdown calculations
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!match.startedAt) return match.durationInMinutes * 60;
    const startTime = new Date(match.startedAt).getTime();
    const endTime = startTime + match.durationInMinutes * 60 * 1000;
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return remaining;
  });

  useEffect(() => {
    if (match.status === 'completed') return;

    const interval = setInterval(() => {
      if (!match.startedAt) return;
      const startTime = new Date(match.startedAt).getTime();
      const endTime = startTime + match.durationInMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match.startedAt, match.durationInMinutes, match.status]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [secondsRemaining]);

  const isLowTime = secondsRemaining < 300 && secondsRemaining > 0; // Under 5 mins
  const isTimeUp = secondsRemaining === 0;

  // Determine current user and opponent stats
  const isPlayer1 = user?._id === match.player1.userId || user?.username === match.player1.displayName;
  const myStats = isPlayer1 ? match.player1Stats : match.player2Stats;
  const opponentStats = isPlayer1 ? match.player2Stats : match.player1Stats;
  const opponentPlayer = isPlayer1 ? match.player2 : match.player1;

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave the active match?')) {
      navigate('/');
    }
  };

  return (
    <header className="glass-strong border-b border-border/80 px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand / Match Badge & Problem Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Swords className="size-4" />
            </div>
            <span className="hidden text-xs font-mono font-bold text-muted-foreground sm:inline">
              {match.roomCode || 'ARENA'}
            </span>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Question Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {questions.map((q, idx) => {
              const isActive = idx === activeQuestionIndex;
              const difficultyColor =
                q.difficulty === 'EASY'
                  ? 'bg-emerald-500'
                  : q.difficulty === 'MEDIUM'
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

              // Check if current user passed this question
              const progress = myStats?.questionProgress?.find(
                (qp) => qp.question.toString() === q._id
              );
              const isSolved =
                progress &&
                progress.testCasesPassed > 0 &&
                progress.testCasesPassed === progress.totalTestCases;

              return (
                <button
                  key={q._id || idx}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-ink text-background shadow-xs'
                      : 'bg-background/60 text-muted-foreground hover:bg-background hover:text-ink border border-border/60'
                  )}
                >
                  <span className={cn('size-2 rounded-full', difficultyColor)} />
                  <span>Problem {idx + 1}</span>
                  {isSolved && <CheckCircle2 className="size-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Live Duel Timer & Opponent Progress Bar */}
        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-mono font-bold transition-colors',
              isTimeUp
                ? 'border-destructive/60 bg-destructive/10 text-destructive animate-pulse'
                : isLowTime
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-border bg-background/50 text-ink'
            )}
          >
            <Clock className="size-3.5" />
            <span>{isTimeUp ? 'TIME UP' : formattedTime}</span>
          </div>

          {/* Opponent Tracker Pill */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-1 text-xs">
            <Users className="size-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5 font-medium">
              <span className="font-bold text-ink">You: {myStats?.totalTestCasesPassed || 0}</span>
              <span className="text-muted-foreground">vs</span>
              <span className="text-muted-foreground">
                {opponentPlayer?.displayName || 'Opponent'}:{' '}
                <strong className="text-ink">{opponentStats?.totalTestCasesPassed || 0}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 text-xs font-semibold text-ink shadow-xs transition-colors hover:bg-secondary disabled:opacity-50"
            title="Run sample test cases"
          >
            <Play className={cn('size-3 fill-current', isRunning && 'animate-spin')} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            type="button"
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-500 active:scale-98 disabled:opacity-50"
            title="Submit solution for scoring"
          >
            <Send className={cn('size-3', isSubmitting && 'animate-spin')} />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>

          <button
            type="button"
            onClick={handleLeave}
            className="glass flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            title="Leave Match"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
