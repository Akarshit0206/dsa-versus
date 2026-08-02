import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { LogOut, User as UserIcon } from 'lucide-react'

export function SiteHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      navigate('/signin', { replace: true })
    }
  }

  return (
    <header className="relative z-20 border-b border-slate-200/80 bg-background/90 backdrop-blur dark:border-slate-800/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link
          to="/"
          className="cursor-pointer text-xl font-extrabold tracking-tight text-slate-900 transition-opacity hover:opacity-90 dark:text-slate-100"
          aria-label="AlgoDuel home"
        >
          algoduel<span className="text-slate-400 dark:text-slate-500">*</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <span className="flex size-5 items-center justify-center rounded-full bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-900">
                  <UserIcon className="size-3" />
                </span>
                <span className="max-w-[120px] truncate sm:max-w-[160px]">{user.username}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-opacity hover:bg-black dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
