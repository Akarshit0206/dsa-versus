import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
        <p className="text-sm font-semibold text-ink">
          algoduel<span className="text-marker">*</span>
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
          <Link to="/" className="text-sm text-muted-foreground hover:text-ink">
            Home
          </Link>
          <Link to="/create-room" className="text-sm text-muted-foreground hover:text-ink">
            Create room
          </Link>
          <Link to="/join-room" className="text-sm text-muted-foreground hover:text-ink">
            Join room
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">Built for people who like winning arguments with code.</p>
      </div>
    </footer>
  )
}
