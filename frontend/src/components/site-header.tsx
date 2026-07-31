import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home', mobileLabel: 'Home' },
  { href: '/join-room', label: 'Join a room', mobileLabel: 'Join' },
]

export function SiteHeader() {
  const location = useLocation()

  return (
    <header className="relative z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-ink"
          aria-label="AlgoDuel home"
        >
          algoduel<span className="text-marker">*</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-ink sm:px-3',
                location.pathname === link.href && 'text-ink',
              )}
            >
              <span className="sm:hidden">{link.mobileLabel}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
          <Link
            to="/create-room"
            className="ml-1 inline-flex h-9 items-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create room
          </Link>
        </nav>
      </div>
    </header>
  )
}
