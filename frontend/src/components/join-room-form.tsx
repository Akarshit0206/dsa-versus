import { useRef, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { cn } from '@/lib/utils'

const CODE_LENGTH = 6

export function JoinRoomForm() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.username || '')
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'joining' | 'joined'>('idle')
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const code = digits.join('')

  function focusInput(index: number) {
    inputsRef.current[index]?.focus()
    inputsRef.current[index]?.select()
  }

  function handleChange(index: number, rawValue: string) {
    const cleaned = rawValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (!cleaned) {
      setDigits((prev) => prev.map((digit, i) => (i === index ? '' : digit)))
      return
    }

    setError(null)
    setDigits((prev) => {
      const next = [...prev]
      for (let i = 0; i < cleaned.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = cleaned[i]
      }
      return next
    })

    const nextIndex = Math.min(index + cleaned.length, CODE_LENGTH - 1)
    focusInput(nextIndex)
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault()
      setDigits((prev) => prev.map((digit, i) => (i === index - 1 ? '' : digit)))
      focusInput(index - 1)
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
    }
    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (code.length < CODE_LENGTH) {
      setError('Enter all six characters of the room code.')
      return
    }

    setError(null)
    setStatus('joining')
    setTimeout(() => setStatus('joined'), 1200)
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
        src="/doodles/time-complexity.png"
        className="-bottom-10 -left-10 -z-10 h-36 w-56"
        tilt="-6deg"
        opacity="opacity-[0.06]"
      />

      <div className="flex flex-col gap-8">
        <div>
          <label htmlFor="player-name" className="block text-sm font-semibold text-ink">
            Your display name
          </label>
          <input
            id="player-name"
            name="player-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. segfault_sam"
            autoComplete="off"
            className="mt-3 h-12 w-full rounded-lg border border-input bg-background/70 px-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-ink">Room code</legend>
          <p className="mt-2 text-xs text-muted-foreground">
            Six characters, sent to you by the host.
          </p>

          <div className="mt-4 flex gap-2 sm:gap-3">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                maxLength={CODE_LENGTH}
                aria-label={`Room code character ${index + 1}`}
                aria-invalid={Boolean(error)}
                className={cn(
                  'h-14 w-full rounded-lg border bg-background/70 text-center font-mono text-xl font-bold uppercase text-ink outline-none sm:h-16 sm:text-2xl',
                  'transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out',
                  'hover:border-ring/70 focus:-translate-y-0.5 focus:border-marker focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_16%,transparent)] motion-reduce:focus:translate-y-0',
                  digit ? 'border-ink/40 bg-background' : 'border-input',
                  error && 'border-destructive/60',
                )}
              />
            ))}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-3 text-sm font-medium text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1"
            >
              {error}
            </p>
          ) : null}
        </fieldset>

        {status === 'joined' ? (
          <div className="glass rounded-lg px-5 py-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
            <p className="text-sm font-semibold text-ink">
              Joined room <span className="font-mono">{code}</span>
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Waiting for the host to start the first round.
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={status === 'joining'}
          className="group/join inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-70 motion-reduce:hover:translate-y-0"
        >
          {status === 'joining' ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Joining room
            </>
          ) : (
            <>
              Join room
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/join:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
