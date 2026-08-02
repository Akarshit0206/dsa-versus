import { Link } from 'react-router'
import { BattlePreview } from '@/components/home/battle-preview'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { DoodleLayer } from '@/components/doodle-layer'
import { MarkerUnderline } from '@/components/marker-underline'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
      {/* Margin doodles (desktop) */}
      <DoodleLayer />

      {/* Mobile watermarks */}
      <DoodleBackdrop
        src="/doodles/swords.png"
        className="-right-6 top-4 h-28 w-28 md:hidden"
        tilt="12deg"
        opacity="opacity-[0.08]"
        interactive={false}
      />
      <DoodleBackdrop
        src="/doodles/time-complexity.png"
        className="-left-10 top-[38%] h-28 w-44 md:hidden"
        tilt="-6deg"
        opacity="opacity-[0.07]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        {/* Top pill badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-300">
          <span className="flex size-2 items-center justify-center rounded-full bg-slate-700 dark:bg-slate-300" aria-hidden="true" />
          Real-time 1v1 coding duels
        </div>

        {/* Main Title with hand-drawn Gray Underline */}
        <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-slate-100">
          Settle it with{' '}
          <span className="group relative inline-block">
            algorithms
            <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full origin-left text-slate-400 transition-transform duration-500 ease-out group-hover:scale-x-105 sm:-bottom-3 sm:h-3.5 dark:text-slate-500" />
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          AlgoDuel is a head-to-head DSA arena. Spin up a room, send the code to a friend, and
          race through the same problem on the same clock.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/create-room"
            className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-black hover:shadow-md active:scale-[0.99] sm:w-auto dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Create a room
          </Link>
          <Link
            to="/join-room"
            className="cursor-pointer inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-800 shadow-2xs transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Join with a code
          </Link>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-14 w-full max-w-4xl sm:mt-18">
        <BattlePreview />
      </div>
    </section>
  )
}
