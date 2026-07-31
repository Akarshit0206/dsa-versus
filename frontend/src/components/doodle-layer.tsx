import { cn } from '@/lib/utils'

type Doodle = {
  src: string
  alt: string
  className: string
  size?: number
  opacity?: string
  rotate?: string
}

const DOODLES: Doodle[] = [
  {
    src: '/doodles/linked-list.png',
    alt: '',
    className: 'left-[1%] top-[14%] w-40 lg:w-56',
    rotate: '-rotate-12',
  },
  {
    src: '/doodles/stack.png',
    alt: '',
    className: 'right-[2%] top-[8%] w-28 lg:w-40',
    rotate: 'rotate-6',
  },
  {
    src: '/doodles/graph.png',
    alt: '',
    className: 'left-[3%] bottom-[16%] w-32 lg:w-44',
    rotate: 'rotate-6',
  },
  {
    src: '/doodles/bst.png',
    alt: '',
    className: 'right-[1%] bottom-[12%] w-36 lg:w-48',
    rotate: '-rotate-6',
  },
  {
    src: '/doodles/swords.png',
    alt: '',
    className: 'right-[8%] top-[46%] w-24 lg:w-32',
    rotate: 'rotate-12',
  },
  {
    src: '/doodles/time-complexity.png',
    alt: '',
    className: 'left-[6%] top-[74%] w-40 lg:w-56',
    rotate: '-rotate-3',
  },
]

const TICKS = [
  { className: 'left-[8%] top-[9%] h-8 w-[3px] rotate-[24deg] bg-border' },
  { className: 'left-[12%] bottom-[34%] h-10 w-[3px] rotate-[24deg] bg-marker' },
  { className: 'right-[14%] top-[22%] h-8 w-[3px] -rotate-[24deg] bg-border' },
  { className: 'right-[6%] top-[68%] h-9 w-[3px] rotate-[24deg] bg-marker' },
  { className: 'left-[5%] top-[52%] h-8 w-[3px] -rotate-[20deg] bg-border' },
  { className: 'right-[18%] bottom-[8%] h-8 w-[3px] rotate-[20deg] bg-border' },
]

export function DoodleLayer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 z-0 hidden select-none overflow-hidden md:block',
        className,
      )}
    >
      {DOODLES.map((doodle, index) => (
        <div
          key={doodle.src + doodle.className}
          className={cn('absolute opacity-70', doodle.className, doodle.rotate)}
        >
          <img
            src={doodle.src || '/placeholder.svg'}
            alt=""
            width={320}
            height={320}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-auto w-full"
          />
        </div>
      ))}

      {TICKS.map((tick) => (
        <span
          key={tick.className}
          className={cn('absolute rounded-full', tick.className)}
        />
      ))}
    </div>
  )
}
