import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { MarkerUnderline } from '@/components/marker-underline'

const STEPS = [
  {
    step: '01',
    title: 'Create a room',
    body: 'Pick a difficulty, a topic and a timer. We hand you a six-character room code instantly.',
    doodle: '/doodles/stack.png',
    doodleClass: '-bottom-8 -right-6 h-32 w-32',
    tilt: '8deg',
  },
  {
    step: '02',
    title: 'Share the code',
    body: 'Send the code to your opponent. They drop it in the join screen and land straight in the lobby.',
    doodle: '/doodles/linked-list.png',
    doodleClass: '-bottom-6 -right-10 h-32 w-40',
    tilt: '-6deg',
  },
  {
    step: '03',
    title: 'Duel it out',
    body: 'Same problem, same clock. First one to pass every hidden test case takes the round.',
    doodle: '/doodles/swords.png',
    doodleClass: '-bottom-8 -right-6 h-32 w-32',
    tilt: '10deg',
  },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t border-border/70 px-5 py-20 sm:px-8 sm:py-24">
      {/* Section-level wash the glass cards blur against — present on mobile too. */}
      <DoodleBackdrop
        src="/doodles/graph.png"
        className="-left-16 top-24 h-56 w-56 sm:h-72 sm:w-72"
        tilt="-8deg"
        opacity="opacity-[0.06]"
        interactive={false}
        float
      />
      <DoodleBackdrop
        src="/doodles/time-complexity.png"
        className="-right-12 bottom-8 h-40 w-64 sm:h-56 sm:w-80"
        tilt="5deg"
        opacity="opacity-[0.06]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              How a duel{' '}
              <span className="group relative inline-block">
                works
                <MarkerUnderline className="absolute -bottom-1.5 left-0 h-2.5 w-full origin-left text-slate-400 transition-transform duration-500 ease-out group-hover:scale-x-105 dark:text-slate-500" />
              </span>
            </h2>
            <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
              Three steps from &ldquo;bet you can&apos;t&rdquo; to a scoreboard. Nothing to install,
              nothing to configure.
            </p>
          </div>

          <div className="mb-1 hidden h-24 w-72 shrink-0 overflow-hidden md:block">
            <img
              src="/doodles/linked-list.png"
              alt="Hand-drawn linked list diagram"
              width={320}
              height={320}
              className="h-72 w-72 -translate-y-24 opacity-80"
            />
          </div>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((item) => (
            <li
              key={item.step}
              className="glass-strong lift group relative cursor-pointer overflow-hidden rounded-xl border border-border/80 p-7 transition-all duration-300 hover:border-zinc-400/40 dark:hover:border-zinc-600/50"
            >
              <DoodleBackdrop
                src={item.doodle}
                className={item.doodleClass}
                tilt={item.tilt}
                opacity="opacity-[0.06]"
                hoverOpacity="group-hover:opacity-[0.12]"
              />

              <div className="relative z-10">
                <span className="inline-block font-mono text-sm font-bold text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-ink">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
