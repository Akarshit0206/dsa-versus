import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, RefreshCw } from 'lucide-react'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { cn } from '@/lib/utils'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
const TOPICS = [
  'Random',
  'Arrays',
  'Strings',
  'Hash maps',
  'Linked lists',
  'Stacks & queues',
  'Trees',
  'Graphs',
  'Dynamic programming',
] as const
const DURATIONS = ['5 min', '15 min', '30 min', '45 min'] as const

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateRoomCode() {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

export function CreateRoomForm() {
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState<string>('Medium')
  const [topic, setTopic] = useState<string>('Random')
  const [duration, setDuration] = useState<string>('15 min')
  const [rounds, setRounds] = useState(1)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRoomCode(generateRoomCode())
    setCopied(false)
  }

  async function handleCopy() {
    if (!roomCode) return
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.log('Clipboard write failed:', error)
    }
  }

  if (roomCode) {
    return (
      <div className="glass-strong group relative isolate overflow-hidden rounded-xl p-7 sm:p-10">
        <DoodleBackdrop
          src="/doodles/swords.png"
          className="-right-10 -top-8 -z-10 h-40 w-40"
          tilt="14deg"
        />
        <DoodleBackdrop
          src="/doodles/time-complexity.png"
          className="-bottom-10 -left-8 -z-10 h-36 w-56"
          tilt="-5deg"
          opacity="opacity-[0.07]"
        />

        <p className="text-sm font-medium text-marker">Room is live</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">
          Share this code with your opponent
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          They enter it on the join screen and drop straight into your lobby.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p
            key={roomCode}
            className="flex h-16 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/70 font-mono text-3xl font-bold tracking-[0.35em] text-ink transition-colors duration-300 hover:border-marker/60 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500"
          >
            {roomCode}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="glass inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-ink transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-marker/50 motion-reduce:hover:translate-y-0 sm:h-16"
          >
            {copied ? (
              <Check
                className="size-4 text-marker motion-safe:animate-in motion-safe:zoom-in-50"
                aria-hidden="true"
              />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy code'}
          </button>
        </div>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border/70 sm:grid-cols-2">
          <SummaryItem label="Host" value={name.trim() || 'Anonymous'} />
          <SummaryItem label="Difficulty" value={difficulty} />
          <SummaryItem label="Topic" value={topic} />
          <SummaryItem label="Round timer" value={duration} />
          <SummaryItem label="Rounds" value={`Best of ${rounds}`} />
          <SummaryItem label="Status" value="Waiting for opponent" />
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setRoomCode(generateRoomCode())}
            className="group/new glass inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold text-ink transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-marker/50 motion-reduce:hover:translate-y-0"
          >
            <RefreshCw
              className="size-4 transition-transform duration-500 group-hover/new:rotate-180 motion-reduce:group-hover/new:rotate-0"
              aria-hidden="true"
            />
            New code
          </button>
          <Link
            to="/join-room"
            className="group/lobby inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] motion-reduce:hover:translate-y-0"
          >
            Go to lobby
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover/lobby:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-strong group relative isolate overflow-hidden rounded-xl p-7 sm:p-10"
    >
      <DoodleBackdrop
        src="/doodles/stack.png"
        className="-right-10 -top-6 -z-10 h-40 w-40"
        tilt="10deg"
        opacity="opacity-[0.07]"
      />
      <DoodleBackdrop
        src="/doodles/graph.png"
        className="-bottom-12 -left-10 -z-10 h-44 w-44"
        tilt="-8deg"
        opacity="opacity-[0.06]"
      />

      <div className="flex flex-col gap-8">
        <div>
          <label htmlFor="host-name" className="block text-sm font-semibold text-ink">
            Your display name
          </label>
          <input
            id="host-name"
            name="host-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. bigO_brain"
            autoComplete="off"
            className="mt-3 h-12 w-full rounded-lg border border-input bg-background/70 px-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Optional — leave it blank to duel anonymously.
          </p>
        </div>

        <OptionGroup
          label="Difficulty"
          options={DIFFICULTIES}
          value={difficulty}
          onChange={setDifficulty}
        />

        <div>
          <label htmlFor="topic" className="block text-sm font-semibold text-ink">
            Topic
          </label>
          <select
            id="topic"
            name="topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-3 h-12 w-full rounded-lg border border-input bg-background/70 px-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
          >
            {TOPICS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <OptionGroup
          label="Round timer"
          options={DURATIONS}
          value={duration}
          onChange={setDuration}
        />

        <div>
          <p className="text-sm font-semibold text-ink">Series length</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 3, 5].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRounds(option)}
                aria-pressed={rounds === option}
                className={cn(
                  'h-11 rounded-lg border px-5 text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
                  rounds === option
                    ? 'border-ink bg-ink text-background shadow-[0_10px_24px_-14px_var(--ink)]'
                    : 'border-border bg-background/70 text-ink hover:border-marker/50 hover:bg-background',
                )}
              >
                Best of {option}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="group/submit inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 motion-reduce:hover:translate-y-0"
        >
          Create room
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover/submit:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </div>
    </form>
  )
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={cn(
              'h-11 rounded-lg border px-5 text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0',
              value === option
                ? 'border-ink bg-ink text-background shadow-[0_10px_24px_-14px_var(--ink)]'
                : 'border-border bg-background/70 text-ink hover:border-marker/50 hover:bg-background',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/70 px-5 py-4 transition-colors duration-300 hover:bg-card">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm font-semibold text-ink">{value}</dd>
    </div>
  )
}
