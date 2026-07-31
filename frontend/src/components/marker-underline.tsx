import { cn } from '@/lib/utils'

export function MarkerUnderline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      aria-hidden="true"
      className={cn('h-3 w-full text-marker', className)}
      preserveAspectRatio="none"
    >
      <path
        d="M2 8.5c14-3.5 28 2 42-1.5S72 2 86 5.5s28 4 42 .5 28-4.5 42-1"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
