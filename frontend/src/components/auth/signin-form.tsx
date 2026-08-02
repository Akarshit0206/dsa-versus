import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { ApiErrorResponse } from '@/lib/api'

export function SignInForm({ bannerMessage }: { bannerMessage?: string | null }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!identifier.trim() || !password) {
      setError('Please fill in both username/email and password.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await login(identifier.trim(), password)
      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect, { replace: true })
    } catch (err) {
      if (err instanceof ApiErrorResponse) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to sign in. Please check your credentials.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong group relative isolate overflow-hidden rounded-xl p-7 sm:p-10"
    >
      <DoodleBackdrop
        src="/doodles/swords.png"
        className="-right-10 -top-8 -z-10 h-44 w-44"
        tilt="12deg"
        opacity="opacity-[0.07]"
      />
      <DoodleBackdrop
        src="/doodles/time-complexity.png"
        className="-bottom-10 -left-8 -z-10 h-36 w-56"
        tilt="-5deg"
        opacity="opacity-[0.06]"
      />

      <div className="flex flex-col gap-6">
        {bannerMessage ? (
          <div className="rounded-lg border border-marker/40 bg-marker/10 px-4 py-3 text-sm font-medium text-ink">
            {bannerMessage}
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive motion-safe:animate-in motion-safe:fade-in"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="identifier" className="block text-sm font-semibold text-ink">
            Username or Email
          </label>
          <div className="relative mt-2">
            <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. alex_coder or alex@example.com"
              autoComplete="username"
              className="h-12 w-full rounded-lg border border-input bg-background/70 pl-11 pr-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-ink">
            Password
          </label>
          <div className="relative mt-2">
            <Lock className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-12 w-full rounded-lg border border-input bg-background/70 pl-11 pr-12 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 p-1 text-muted-foreground transition-colors hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group/btn inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 motion-reduce:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            to={`/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
            className="font-semibold text-marker hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  )
}
