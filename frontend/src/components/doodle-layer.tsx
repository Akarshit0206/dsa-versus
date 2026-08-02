import { cn } from '@/lib/utils'

type Doodle = {
  src: string
  alt: string
  className: string
  rotate?: string
}

const DOODLES: Doodle[] = [
  {
    src: '/doodles/linked-list.png',
    alt: '',
    className: 'left-[1%] top-[5%] w-36 lg:w-48',
    rotate: '-rotate-12',
  },
  {
    src: '/doodles/stack.png',
    alt: '',
    className: 'right-[1.5%] top-[4%] w-28 lg:w-36',
    rotate: 'rotate-6',
  },
  {
    src: '/doodles/graph.png',
    alt: '',
    className: 'left-[1.5%] top-[42%] w-28 lg:w-36',
    rotate: 'rotate-6',
  },
  {
    src: '/doodles/swords.png',
    alt: '',
    className: 'right-[2%] top-[42%] w-24 lg:w-32',
    rotate: 'rotate-12',
  },
  {
    src: '/doodles/time-complexity.png',
    alt: '',
    className: 'left-[1%] bottom-[2%] w-36 lg:w-48',
    rotate: '-rotate-3',
  },
  {
    src: '/doodles/bst.png',
    alt: '',
    className: 'right-[1.5%] bottom-[2%] w-32 lg:w-40',
    rotate: '-rotate-6',
  },
]

const TICKS = [
  { className: 'left-[6%] top-[25%] h-8 w-[2.5px] rotate-[24deg] bg-slate-300 dark:bg-slate-700' },
  { className: 'right-[6%] top-[26%] h-8 w-[2.5px] -rotate-[24deg] bg-slate-300 dark:bg-slate-700' },
  { className: 'left-[5%] top-[68%] h-8 w-[2.5px] -rotate-[20deg] bg-slate-300 dark:bg-slate-700' },
  { className: 'right-[5%] top-[68%] h-8 w-[2.5px] rotate-[20deg] bg-slate-300 dark:bg-slate-700' },
]

export function DoodleLayer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 z-0 hidden select-none overflow-hidden transform-gpu md:block',
        className,
      )}
    >
      {DOODLES.map((doodle, index) => (
        <div
          key={doodle.src + doodle.className}
          className={cn('absolute opacity-65 transform-gpu', doodle.className, doodle.rotate)}
        >
          <img
            src={doodle.src || '/placeholder.svg'}
            alt=""
            width={320}
            height={320}
            loading={index < 2 ? 'eager' : 'lazy'}
            className="h-auto w-full transform-gpu"
          />
        </div>
      ))}

      {TICKS.map((tick) => (
        <span
          key={tick.className}
          className={cn('absolute rounded-full transform-gpu', tick.className)}
        />
      ))}
    </div>
  )
}
