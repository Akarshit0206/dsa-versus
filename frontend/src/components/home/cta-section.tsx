import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DoodleBackdrop } from '@/components/doodle-backdrop'

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/70 px-5 py-20 sm:px-8 sm:py-28">
      <img
        src="/doodles/graph.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute -left-4 top-10 hidden h-auto w-40 -rotate-12 opacity-60 lg:block"
      />
      <img
        src="/doodles/swords.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute -right-2 bottom-8 hidden h-auto w-36 rotate-12 opacity-60 lg:block"
      />

      {/* Mobile / tablet watermarks so the doodles never disappear. */}
      <DoodleBackdrop
        src="/doodles/time-complexity.png"
        className="left-1/2 top-6 h-32 w-56 -translate-x-1/2 lg:hidden"
        tilt="-3deg"
        opacity="opacity-[0.07]"
        interactive={false}
      />
      <DoodleBackdrop
        src="/doodles/bst.png"
        className="-left-12 bottom-6 h-36 w-36 lg:hidden"
        tilt="8deg"
        opacity="opacity-[0.06]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Someone owes you a rematch
        </h2>
        <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
          Open a room, drop the code in the group chat, and find out who actually remembers how a
          heap works.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/create-room"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            Start a duel
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            to="/join-room"
            className="glass inline-flex h-12 w-full items-center justify-center rounded-lg px-7 text-sm font-semibold text-ink transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-marker/40 motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            I have a code
          </Link>
        </div>
      </div>
    </section>
  )
}
