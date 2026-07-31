import { cn } from '@/lib/utils'

/**
 * A doodle watermark that lives *inside* a card or box.
 * Renders at every breakpoint so the hand-drawn theme survives on mobile.
 */
export function DoodleBackdrop({
  src,
  className,
  tilt = '0deg',
  float = false,
  interactive = true,
  opacity = 'opacity-[0.09]',
  hoverOpacity = 'group-hover:opacity-[0.17]',
}: {
  src: string
  className?: string
  tilt?: string
  float?: boolean
  interactive?: boolean
  opacity?: string
  hoverOpacity?: string
}) {
  return (
    <div
      aria-hidden="true"
      style={{ '--tilt': tilt } as React.CSSProperties}
      className={cn(
        'pointer-events-none absolute z-0 select-none',
        'transition-opacity duration-500 ease-out',
        opacity,
        interactive && hoverOpacity,
        float && 'animate-float',
        className,
      )}
    >
      <div
        className={cn(
          'h-full w-full transition-transform duration-500 ease-out',
          interactive && 'group-hover:scale-[1.07] motion-reduce:group-hover:scale-100',
        )}
      >
        <div className="h-full w-full" style={{ transform: `rotate(${float ? '0deg' : tilt})` }}>
          <img
            src={src || '/placeholder.svg'}
            alt=""
            width={420}
            height={420}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
