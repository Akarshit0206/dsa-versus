import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BattlePreview } from '@/components/home/battle-preview'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { DoodleLayer } from '@/components/doodle-layer'
import { MarkerUnderline } from '@/components/marker-underline'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
      {/* Margin doodles (desktop) */}
      <DoodleLayer />

      {/* Mobile keeps the hand-drawn theme via in-flow watermarks. */}
      <DoodleBackdrop
        src="/doodles/swords.png"
        className="-right-6 top-4 h-28 w-28 md:hidden"
        tilt="12deg"
        opacity="opacity-[0.1]"
        interactive={false}
      />
      <DoodleBackdrop
        src="/doodles/time-complexity.png"
        className="-left-10 top-[38%] h-28 w-44 md:hidden"
        tilt="-6deg"
        opacity="opacity-[0.08]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <p className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex size-1.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-marker opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-1.5 rounded-full bg-marker" />
          </span>
          Real-time 1v1 coding duels
        </p>

        <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
          Settle it with{' '}
          <span className="group relative inline-block">
            algorithms
            <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full origin-left transition-transform duration-500 ease-out group-hover:scale-x-105 sm:-bottom-3 sm:h-3.5" />
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          AlgoDuel is a head-to-head DSA arena. Spin up a room, send the code to a friend, and
          race through the same problem on the same clock.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/create-room"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Create a room
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/join-room"
            className="glass inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-7 text-sm font-semibold text-ink transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-marker/40 motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Join with a code
          </Link>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">No signup required</p>
      </div>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-4xl sm:mt-20">
        <BattlePreview />
      </div>
    </section>
  )
}
