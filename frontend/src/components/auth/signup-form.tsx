import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, User, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { ApiErrorResponse } from '@/lib/api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)\S{4,}$/

const BLOCKED_DOMAINS = [
  'test.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'trashmail.com',
]

export function SignUpForm() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const hasLetter = /[A-Za-z]/.test(password)
  const hasDigit = /\d/.test(password)
  const isLongEnough = password.length >= 4
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    const domain = trimmedEmail.split('@')[1]?.toLowerCase()
    if (domain && BLOCKED_DOMAINS.includes(domain)) {
      setError('Temporary or disposable email domains are not allowed.')
      return
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be at least 4 characters and contain both letters and numbers.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await register(trimmedUsername, trimmedEmail, password)
      const redirect = searchParams.get('redirect') || '/'
      navigate(redirect, { replace: true })
    } catch (err) {
      if (err instanceof ApiErrorResponse) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to create account. Please try again.')
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
        src="/doodles/bst.png"
        className="-right-12 -top-8 -z-10 h-44 w-44"
        tilt="9deg"
        opacity="opacity-[0.07]"
      />
      <DoodleBackdrop
        src="/doodles/graph.png"
        className="-bottom-12 -left-10 -z-10 h-44 w-44"
        tilt="-8deg"
        opacity="opacity-[0.06]"
      />

      <div className="flex flex-col gap-5">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive motion-safe:animate-in motion-safe:fade-in"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-ink">
            Username
          </label>
          <div className="relative mt-2">
            <User className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. bigO_master"
              autoComplete="username"
              className="h-12 w-full rounded-lg border border-input bg-background/70 pl-11 pr-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink">
            Email address
          </label>
          <div className="relative mt-2">
            <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. coder@domain.com"
              autoComplete="email"
              className="h-12 w-full rounded-lg border border-input bg-background/70 pl-11 pr-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-semibold text-ink">
            Password
          </label>
          <div className="relative mt-2">
            <Lock className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
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

          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className={`inline-flex items-center gap-1 ${isLongEnough ? 'text-marker' : 'text-muted-foreground'}`}>
              {isLongEnough ? <Check className="size-3" /> : <X className="size-3" />} Min 4 characters
            </span>
            <span className={`inline-flex items-center gap-1 ${hasLetter ? 'text-marker' : 'text-muted-foreground'}`}>
              {hasLetter ? <Check className="size-3" /> : <X className="size-3" />} Includes letters
            </span>
            <span className={`inline-flex items-center gap-1 ${hasDigit ? 'text-marker' : 'text-muted-foreground'}`}>
              {hasDigit ? <Check className="size-3" /> : <X className="size-3" />} Includes numbers
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-ink">
            Confirm password
          </label>
          <div className="relative mt-2">
            <Lock className="absolute left-4 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-input bg-background/70 pl-11 pr-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
            />
          </div>
          {confirmPassword ? (
            <p className={`mt-1.5 text-xs font-medium ${passwordsMatch ? 'text-marker' : 'text-destructive'}`}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group/btn mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 motion-reduce:hover:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to={`/signin${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
            className="font-semibold text-marker hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}
