import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import {
  Trophy,
  Swords,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  Flame,
  ArrowRight,
  Sparkles,
  Loader2,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';
import { DoodleBackdrop } from '@/components/doodle-backdrop';
import { MarkerUnderline } from '@/components/marker-underline';
import type { FullUserProfile, RecentMatch } from '@/types';

// Predefined fun avatar emojis for quick avatar selection
const AVATAR_OPTIONS = ['⚡', '🤖', '👾', '🚀', '🧠', '🧙', '🐉', '🐱', '🦊', '🔥'];

const MATCHES_PER_PAGE = 5;

export function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Match list display mode & pagination
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Avatar picker modal state
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Match details modal state
  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedMatch(null);
        setShowAvatarPicker(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (!selectedMatch && !showAvatarPicker) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [selectedMatch, showAvatarPicker]);

  // Fetch full profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setIsLoading(true);
    try {
      const res = await apiRequest<FullUserProfile>('/api/user/profile', {
        method: 'GET',
      });
      if (res.success && res.data) {
        setProfileData(res.data);
        if (res.data.user) {
          updateUser(res.data.user);
        }
      }
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }

  // Update avatar
  async function handleSelectAvatar(emoji: string) {
    setIsUpdatingAvatar(true);
    try {
      const res = await apiRequest<{ avatar: string }>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ avatar: emoji }),
      });

      if (res.success) {
        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                user: { ...prev.user, avatar: emoji },
              }
            : null
        );
        updateUser({ avatar: emoji });
        setShowAvatarPicker(false);
      }
    } catch {
      // Handled silently
    } finally {
      setIsUpdatingAvatar(false);
    }
  }

  const currentUser = profileData?.user || authUser;
  const stats = profileData?.stats || {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    problemsSolved: 0,
    totalTestCasesPassed: 0,
  };
  const recentMatches: RecentMatch[] = profileData?.recentMatches || [];

  const totalMatches = recentMatches.length;
  const totalPages = Math.ceil(totalMatches / MATCHES_PER_PAGE);

  // Sliced matches: either top 3 or paginated by 5
  const displayedMatches = showAllMatches
    ? recentMatches.slice((currentPage - 1) * MATCHES_PER_PAGE, currentPage * MATCHES_PER_PAGE)
    : recentMatches.slice(0, 3);

  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Oct 2026';

  if (isLoading && !profileData) {
    return (
      <div className="flex h-[calc(100dvh-8rem)] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-slate-800 dark:text-slate-200" />
        <p className="text-sm font-medium text-muted-foreground">Loading duelist profile...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] overflow-hidden">
      {/* Background Margin Doodles (Desktop - Tasteful & Non-overlapping) */}
      <img
        src="/doodles/swords.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute right-[3%] top-24 hidden h-auto w-32 rotate-12 opacity-50 select-none lg:block"
      />
      <img
        src="/doodles/graph.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute left-[3%] bottom-28 hidden h-auto w-36 -rotate-6 opacity-45 select-none lg:block"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {/* 1. Profile Header Hero */}
        <div className="glass-strong group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          {/* In-form Doodle Watermark (Stack matching Create Room reference) */}
          <DoodleBackdrop
            src="/doodles/stack.png"
            className="-right-8 -top-6 -z-10 h-36 w-36"
            tilt="10deg"
            opacity="opacity-[0.07]"
            hoverOpacity="group-hover:opacity-[0.14]"
          />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar Pill with Edit Option */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="relative flex size-18 sm:size-20 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-2xl font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 dark:from-slate-700 dark:to-slate-900"
                  title="Change battle avatar"
                >
                  {currentUser?.avatar ? (
                    <span className="text-3xl sm:text-4xl">{currentUser.avatar}</span>
                  ) : (
                    <span className="text-2xl uppercase tracking-wider font-extrabold text-white">
                      {currentUser?.username?.[0] || 'U'}
                    </span>
                  )}
                  <span className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-slate-900 border-2 border-white text-[10px] text-white shadow-xs dark:border-slate-900">
                    ✎
                  </span>
                </button>
              </div>

              {/* Username & Metadata */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="relative inline-block">
                    <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                      {currentUser?.username}
                    </h1>
                    <MarkerUnderline className="absolute -bottom-1.5 left-0 h-2 w-full text-slate-400 dark:text-slate-500" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-3" />
                    Duelist
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                  {currentUser?.email && (
                    <span className="truncate max-w-[200px] sm:max-w-none">{currentUser.email}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Joined {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Duel CTA Buttons */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/create-room"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-black hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Swords className="size-4" />
                <span>Create Duel</span>
              </Link>
              <Link
                to="/join-room"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Join Room</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Key Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {/* Matches Played */}
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Matches</span>
              <Gamepad2 className="size-4 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="mt-2 text-2xl font-black text-ink">{stats.matchesPlayed}</div>
            <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
              {stats.wins}W - {stats.losses}L{stats.draws > 0 ? ` - ${stats.draws}D` : ''}
            </div>
          </div>

          {/* Win Rate */}
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
              <Trophy className="size-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-ink">{stats.winRate}%</div>
            {/* Win percentage bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
              />
            </div>
          </div>

          {/* Problems Solved */}
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Solved</span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-ink">{stats.problemsSolved}</div>
            <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
              Completed in duels
            </div>
          </div>

          {/* Total Test Cases Passed */}
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Tests Passed</span>
              <Flame className="size-4 text-orange-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-ink">{stats.totalTestCasesPassed}</div>
            <div className="mt-1 text-[11px] font-semibold text-muted-foreground">
              Evaluated testcases
            </div>
          </div>
        </div>

        {/* 3. Match History Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                <Swords className="size-3.5" />
              </span>
              <h2 className="text-base font-bold text-ink">
                {showAllMatches ? `Match History (${totalMatches})` : 'Recent Matches'}
              </h2>
              {!showAllMatches && totalMatches > 0 && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  Last {Math.min(3, totalMatches)}
                </span>
              )}
            </div>

            {totalMatches > 3 && (
              <button
                type="button"
                onClick={() => {
                  setShowAllMatches((prev) => !prev);
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-ink hover:bg-secondary transition-colors cursor-pointer shadow-xs"
              >
                {showAllMatches ? (
                  <span>Show Last 3</span>
                ) : (
                  <>
                    <span>Show All ({totalMatches})</span>
                    <ChevronRight className="size-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Matches List */}
          <div className="mt-4">
            {recentMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-card/30">
                <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
                  <Gamepad2 className="size-7" />
                </div>
                <h3 className="text-base font-bold text-ink">No match records yet</h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Jump into an arena, challenge a friend, and race to solve algorithmic problems!
                </p>
                <Link
                  to="/create-room"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 dark:bg-slate-100 dark:text-slate-900"
                >
                  <Swords className="size-3.5" />
                  <span>Start Your First Duel</span>
                </Link>
              </div>
            ) : (
            <div className="space-y-3">
              {displayedMatches.map((m) => {
                const isVictory = m.result === 'VICTORY';
                const isDefeat = m.result === 'DEFEAT';

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedMatch(m);
                      }
                    }}
                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-xs transition-all hover:border-slate-400 dark:hover:border-slate-700 hover:bg-card/90 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left: Result Badge & Opponent */}
                    <div className="flex items-center gap-3.5">
                      {/* Result Badge */}
                      <div
                        className={cn(
                          'flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center font-black uppercase tracking-tight text-xs shadow-xs',
                          isVictory
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : isDefeat
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        )}
                      >
                        <span>{m.result === 'VICTORY' ? 'WIN' : m.result === 'DEFEAT' ? 'LOSS' : 'DRAW'}</span>
                      </div>

                      {/* Duel vs Opponent */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <span>vs</span>
                          <span className="font-bold text-ink text-sm">
                            @{m.opponent.username}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          Click to view match details
                        </span>
                      </div>
                    </div>

                    {/* Right: Scores & Timings */}
                    <div className="flex items-center justify-between gap-6 border-t border-border/60 pt-2 sm:border-t-0 sm:pt-0">
                      {/* Score Comparison */}
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-ink">
                          <span className={isVictory ? 'text-emerald-500 font-extrabold' : ''}>
                            {m.myScore}
                          </span>
                          {' - '}
                          <span className={isDefeat ? 'text-rose-500 font-extrabold' : ''}>
                            {m.opponentScore}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">tests passed</div>
                      </div>

                      {/* Date / Time */}
                      <div className="text-right text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="size-3" />
                          {m.timeTaken > 0 ? `${m.timeTaken}s` : `${m.duration}m limit`}
                        </div>
                        <div>
                          {new Date(m.playedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>

                      {/* Chevron Arrow */}
                      <ChevronRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-ink hidden sm:block" />
                    </div>
                  </div>
                );
              })}

              {/* "Show All Matches" Bar when on top 3 view */}
              {!showAllMatches && totalMatches > 3 && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllMatches(true);
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <span>Show All {totalMatches} Matches</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Pagination Controls when in Show All view */}
              {showAllMatches && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80 pt-4 text-xs text-muted-foreground">
                  <div>
                    Showing <span className="font-bold text-ink">{(currentPage - 1) * MATCHES_PER_PAGE + 1}</span> -{' '}
                    <span className="font-bold text-ink">
                      {Math.min(currentPage * MATCHES_PER_PAGE, totalMatches)}
                    </span>{' '}
                    of <span className="font-bold text-ink">{totalMatches}</span> matches
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="size-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={cn(
                          'size-8 rounded-lg text-xs font-bold transition-all cursor-pointer',
                          currentPage === pg
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                            : 'border border-border bg-background hover:bg-secondary text-ink'
                        )}
                      >
                        {pg}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain animate-in fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setSelectedMatch(null)}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 overflow-hidden overscroll-contain">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                    <Swords className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-ink">Match Details</h3>
                    <p className="text-[11px] text-muted-foreground">
                      All questions & testcases performance
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-ink transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 overscroll-contain">
              {/* Head-to-Head Duel Summary */}
              <div className="group relative isolate overflow-hidden rounded-xl border border-border/80 bg-secondary/30 p-4">
                <DoodleBackdrop
                  src="/doodles/swords.png"
                  className="-right-8 -top-8 -z-10 h-32 w-32"
                  tilt="12deg"
                  opacity="opacity-[0.06]"
                />
                <div className="flex items-center justify-between gap-4">
                  {/* You */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0">
                    <div className="flex size-11 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-base font-bold shadow-xs">
                      {currentUser?.avatar || currentUser?.username?.[0] || 'U'}
                    </div>
                    <span className="mt-1.5 text-xs font-bold text-ink truncate max-w-full">
                      {currentUser?.username || 'You'} (You)
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedMatch.myScore} passed
                    </span>
                  </div>

                  {/* Verdict & Score */}
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider',
                        selectedMatch.result === 'VICTORY'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : selectedMatch.result === 'DEFEAT'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      )}
                    >
                      {selectedMatch.result === 'VICTORY'
                        ? 'WIN'
                        : selectedMatch.result === 'DEFEAT'
                        ? 'LOSS'
                        : 'DRAW'}
                    </span>
                    <div className="mt-1 text-xl font-black font-mono text-ink">
                      {selectedMatch.myScore} - {selectedMatch.opponentScore}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      Total Tests
                    </span>
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0">
                    <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-ink border border-border text-base font-bold shadow-xs">
                      {selectedMatch.opponent.avatar || selectedMatch.opponent.username?.[0] || 'O'}
                    </div>
                    <span className="mt-1.5 text-xs font-bold text-ink truncate max-w-full">
                      @{selectedMatch.opponent.username}
                    </span>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {selectedMatch.opponentScore} passed
                    </span>
                  </div>
                </div>

                {/* Match Timing & Date Footer */}
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" />
                    <span>
                      {selectedMatch.timeTaken > 0
                        ? `${selectedMatch.timeTaken}s elapsed`
                        : `${selectedMatch.duration}m limit`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3 text-muted-foreground" />
                    <span>
                      {new Date(selectedMatch.playedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Questions & Test Cases Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Questions & Test Cases ({selectedMatch.questions?.length || 0})
                  </h4>
                </div>

                {!selectedMatch.questions || selectedMatch.questions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No individual question breakdown available for this match.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedMatch.questions.map((q, qIndex) => {
                      const myPassed = q.myTestCasesPassed ?? q.testCasesPassed ?? 0;
                      const oppPassed = q.opponentTestCasesPassed ?? 0;
                      const totalTests = q.totalTestCases || Math.max(myPassed, oppPassed, 0);

                      const myPercentage =
                        totalTests > 0 ? Math.min(100, Math.round((myPassed / totalTests) * 100)) : 0;
                      const oppPercentage =
                        totalTests > 0 ? Math.min(100, Math.round((oppPassed / totalTests) * 100)) : 0;

                      const isAllPassed = totalTests > 0 && myPassed === totalTests;

                      return (
                        <div
                          key={q._id || qIndex}
                          className="rounded-xl border border-border/80 bg-background/60 p-4 shadow-xs space-y-3"
                        >
                          {/* Question Title & Meta */}
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-muted-foreground">
                                  Q{qIndex + 1}.
                                </span>
                                <h5 className="text-sm font-bold text-ink">
                                  {q.title}
                                </h5>
                              </div>

                              {/* Topics */}
                              {q.topics && q.topics.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {q.topics.map((topic, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={cn(
                                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                  q.difficulty === 'EASY'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : q.difficulty === 'HARD'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                )}
                              >
                                {q.difficulty || 'MEDIUM'}
                              </span>

                              {isAllPassed && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="size-3" />
                                  Solved
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Test Cases Comparison Grid */}
                          <div className="rounded-lg border border-border/60 bg-secondary/20 p-3 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                              <span>Total Test Cases</span>
                              <span className="font-mono font-bold text-ink">{totalTests}</span>
                            </div>

                            {/* You vs Opponent Bars */}
                            <div className="space-y-2 pt-1 border-t border-border/40">
                              {/* You */}
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-ink flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    You
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-ink">
                                    {myPassed} / {totalTests} passed ({myPercentage}%)
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                    style={{ width: `${myPercentage}%` }}
                                  />
                                </div>
                              </div>

                              {/* Opponent */}
                              <div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-slate-400" />
                                    @{selectedMatch.opponent.username}
                                  </span>
                                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                    {oppPassed} / {totalTests} passed ({oppPercentage}%)
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                                    style={{ width: `${oppPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-border bg-secondary/10 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-ink hover:bg-secondary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Battle Avatar Picker Modal */}
      {showAvatarPicker &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain animate-in fade-in">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setShowAvatarPicker(false)}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 overscroll-contain">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-ink">Choose Battle Avatar</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Select an avatar icon to represent you across duel arenas and leaderboards.
              </p>

              <div className="mt-4 grid grid-cols-5 gap-2.5">
                {AVATAR_OPTIONS.map((emoji) => {
                  const isSelected = currentUser?.avatar === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectAvatar(emoji)}
                      disabled={isUpdatingAvatar}
                      className={cn(
                        'flex size-13 items-center justify-center rounded-xl text-2xl transition-all cursor-pointer hover:scale-110 active:scale-95',
                        isSelected
                          ? 'border-2 border-slate-900 bg-secondary shadow-xs dark:border-white'
                          : 'border border-border/60 bg-secondary/40 hover:bg-secondary'
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>

              {isUpdatingAvatar && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving avatar...</span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
