import { Clock, Swords, Trophy, Users } from 'lucide-react'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { MarkerUnderline } from '@/components/marker-underline'

const FEATURES = [
  {
    icon: Swords,
    title: 'Live head-to-head',
    body: 'Watch your opponent’s test-case progress tick up in real time while you type.',
    doodle: '/doodles/swords.png',
    doodleClass: '-bottom-7 -right-6 h-28 w-28',
    tilt: '10deg',
  },
  {
    icon: Clock,
    title: 'Your own clock',
    body: 'Blitz rounds at 5 minutes or long-form contests at 45. The host decides.',
    doodle: '/doodles/time-complexity.png',
    doodleClass: '-bottom-5 -right-8 h-24 w-40',
    tilt: '-5deg',
  },
  {
    icon: Users,
    title: 'Private rooms',
    body: 'Rooms are code-gated, so only the person you send it to can walk in.',
    doodle: '/doodles/graph.png',
    doodleClass: '-bottom-7 -right-6 h-28 w-28',
    tilt: '6deg',
  },
  {
    icon: Trophy,
    title: 'Best-of series',
    body: 'Stack multiple problems into a series and let the scoreboard settle it.',
    doodle: '/doodles/stack.png',
    doodleClass: '-bottom-7 -right-5 h-28 w-28',
    tilt: '-8deg',
  },
]

const TOPICS = ['Arrays', 'Strings', 'Hash maps', 'Two pointers', 'Linked lists', 'Stacks', 'Trees', 'Graphs', 'DP', 'Greedy']

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/70 bg-secondary/40 px-5 py-20 sm:px-8 sm:py-24">
      {/* Backdrop the frosted cards blur against, at every breakpoint. */}
      <DoodleBackdrop
        src="/doodles/bst.png"
        className="-right-14 top-16 h-52 w-52 sm:h-72 sm:w-72"
        tilt="7deg"
        opacity="opacity-[0.06]"
        interactive={false}
        float
      />
      <DoodleBackdrop
        src="/doodles/linked-list.png"
        className="-left-20 bottom-24 h-48 w-48 sm:h-64 sm:w-64"
        tilt="-10deg"
        opacity="opacity-[0.05]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Built for{' '}
            <span className="group relative inline-block">
              rivalry
              <MarkerUnderline className="absolute -bottom-1.5 left-0 h-2.5 w-full origin-left transition-transform duration-500 ease-out group-hover:scale-x-105" />
            </span>
          </h2>
          <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
            Everything you need to turn interview prep into something you actually want to do
            again tomorrow.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass lift group relative overflow-hidden rounded-xl p-7"
            >
              <DoodleBackdrop
                src={feature.doodle}
                className={feature.doodleClass}
                tilt={feature.tilt}
              />

              <div className="relative z-10">
                <feature.icon
                  className="size-5 text-marker transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-base font-bold text-ink">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass group relative mt-8 grid gap-6 overflow-hidden rounded-xl p-7 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <DoodleBackdrop
            src="/doodles/time-complexity.png"
            className="-bottom-10 left-1/4 h-40 w-64 lg:hidden"
            tilt="-4deg"
            opacity="opacity-[0.07]"
          />

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-ink sm:text-2xl">Every topic on the board</h3>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              Pick a single topic to grind or leave it on random and let the arena decide what you
              are weakest at.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <li
                  key={topic}
                  className="cursor-default rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-ink transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-marker/50 hover:bg-background motion-reduce:hover:translate-y-0"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <img
              src="/doodles/time-complexity.png"
              alt="Hand-drawn comparative time complexity diagram"
              width={520}
              height={340}
              className="hidden h-auto w-full max-w-sm opacity-80 transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 lg:block"
            />
            <div className="flex items-center justify-center gap-6 lg:hidden">
              <img
                src="/doodles/stack.png"
                alt="Hand-drawn stack push and pop diagram"
                width={320}
                height={320}
                className="h-auto w-28 opacity-80 sm:w-36"
              />
              <img
                src="/doodles/bst.png"
                alt="Hand-drawn binary search tree diagram"
                width={320}
                height={320}
                className="h-auto w-36 opacity-80 sm:w-44"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
