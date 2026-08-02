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
    <section className="relative overflow-hidden border-t border-slate-200/80 bg-slate-100/30 px-5 py-20 sm:px-8 sm:py-24 dark:border-slate-800/80 dark:bg-slate-900/30">
      {/* Background Doodles */}
      <DoodleBackdrop
        src="/doodles/bst.png"
        className="-right-14 top-16 h-52 w-52 sm:h-72 sm:w-72"
        tilt="7deg"
        opacity="opacity-[0.05]"
        interactive={false}
        float
      />
      <DoodleBackdrop
        src="/doodles/linked-list.png"
        className="-left-20 bottom-24 h-48 w-48 sm:h-64 sm:w-64"
        tilt="-10deg"
        opacity="opacity-[0.04]"
        interactive={false}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            Built for{' '}
            <span className="group relative inline-block">
              rivalry
              <MarkerUnderline className="absolute -bottom-1.5 left-0 h-2.5 w-full origin-left text-slate-400 transition-transform duration-500 ease-out group-hover:scale-x-105 dark:text-slate-500" />
            </span>
          </h2>
          <p className="mt-5 text-pretty text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
            Everything you need to turn interview prep into something you actually want to do
            again tomorrow.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass-strong lift group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 bg-white/90 p-6 transition-all duration-300 hover:border-slate-400 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-600"
            >
              <DoodleBackdrop
                src={feature.doodle}
                className={feature.doodleClass}
                tilt={feature.tilt}
                opacity="opacity-[0.06]"
                hoverOpacity="group-hover:opacity-[0.12]"
              />

              <div className="relative z-10">
                <div className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-900 shadow-xs transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <feature.icon className="size-5 text-slate-800 transition-transform duration-300 group-hover:rotate-3 dark:text-slate-200" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Topics Board Section */}
        <div className="glass-strong group relative mt-8 grid gap-6 overflow-hidden rounded-xl border border-slate-200/90 p-7 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 dark:border-slate-800">
          <DoodleBackdrop
            src="/doodles/time-complexity.png"
            className="-bottom-10 left-1/4 h-40 w-64 lg:hidden"
            tilt="-4deg"
            opacity="opacity-[0.05]"
          />

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">Every topic on the board</h3>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Pick a single topic to grind or leave it on random and let the arena decide what you
              are weakest at.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <li
                  key={topic}
                  className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 hover:text-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-100 dark:hover:text-slate-900"
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
              className="hidden h-auto w-full max-w-sm opacity-75 transition-transform duration-500 ease-out group-hover:scale-[1.02] lg:block"
            />
            <div className="flex items-center justify-center gap-6 lg:hidden">
              <img
                src="/doodles/stack.png"
                alt="Hand-drawn stack push and pop diagram"
                width={320}
                height={320}
                className="h-auto w-28 opacity-75 sm:w-36"
              />
              <img
                src="/doodles/bst.png"
                alt="Hand-drawn binary search tree diagram"
                width={320}
                height={320}
                className="h-auto w-36 opacity-75 sm:w-44"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
