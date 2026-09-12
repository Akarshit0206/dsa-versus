import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRoomSocket } from '@/hooks/useRoomSocket'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { cn } from '@/lib/utils'
import type { RoomFormat } from '@/types'

export type { RoomFormat }

interface FormatInfo {
  name: string
  label: string
  rules: string[]
}

const FORMAT_PRESETS: Record<Exclude<RoomFormat, 'custom'>, FormatInfo> = {
  blitz: {
    name: 'blitz',
    label: 'Blitz',
    rules: [
      'Game Time: 20 minutes total',
      'Total Questions: 2 problems',
      'Difficulty Breakdown: 1 Easy, 1 Medium',
      'Speed-focused duel testing rapid implementation',
    ],
  },
  standard: {
    name: 'standard',
    label: 'Standard',
    rules: [
      'Game Time: 45 minutes total',
      'Total Questions: 3 problems',
      'Difficulty Breakdown: 1 Easy, 2 Medium',
      'Balanced competitive match testing core algorithms',
    ],
  },
  classic: {
    name: 'classic',
    label: 'Classic',
    rules: [
      'Game Time: 60 minutes total',
      'Total Questions: 3 problems',
      'Difficulty Breakdown: 1 Easy, 1 Medium, 1 Hard',
      'Endurance duel testing deep problem solving and optimization',
    ],
  },
}

const AVAILABLE_TOPICS = [
  "Arrays",
  "Strings",
  "Hash maps",
  "Stacks & queues",
  "Greedy",
  "Binary Search",
  "Dynamic programming"
] as const

export function CreateRoomForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createRoom, isLoading: isCreating, error: roomError } = useRoomSocket()

  const [name, setName] = useState(user?.username || '')
  const [format, setFormat] = useState<RoomFormat>('standard')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Custom configuration states
  const [customDuration, setCustomDuration] = useState<number>(30)
  const [easyCount, setEasyCount] = useState<number>(1)
  const [mediumCount, setMediumCount] = useState<number>(1)
  const [hardCount, setHardCount] = useState<number>(0)

  const totalCustomQuestions = easyCount + mediumCount + hardCount
  const isFormValid =
    format !== 'custom' ||
    (customDuration >= 10 &&
      customDuration <= 60 &&
      totalCustomQuestions >= 1 &&
      totalCustomQuestions <= 3)

  function toggleTopic(topic: string) {
    let updated: string[]
    if (selectedTopics.includes(topic)) {
      updated = selectedTopics.filter((t) => t !== topic)
    } else {
      updated = [...selectedTopics, topic]
    }

    // If user manually selects all available topics, automatically convert to "All Topics"
    if (updated.length === AVAILABLE_TOPICS.length) {
      setSelectedTopics([])
    } else {
      setSelectedTopics(updated)
    }
  }

  function handleSelectAllTopics() {
    setSelectedTopics([])
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isFormValid || isCreating) return

    try {
      const room = await createRoom({
        format,
        topics: selectedTopics,
        customConfig:
          format === 'custom'
            ? {
                duration: customDuration,
                easyCount,
                mediumCount,
                hardCount,
              }
            : undefined,
        displayName: name.trim() || undefined,
      })

      // Navigate directly into the real-time Room Lobby!
      navigate(`/room/${room.code}`)
    } catch {
      // Error message is stored in roomError state by useRoomSocket
    }
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

      <div className="flex flex-col gap-6">
        {/* Error Banner */}
        {roomError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{roomError}</span>
          </div>
        )}

        {/* Host Display Name */}
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
            className="mt-2.5 h-11 w-full rounded-lg border border-input bg-background/70 px-4 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-muted-foreground hover:border-ring/70 focus:border-marker/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--marker)_14%,transparent)]"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Optional — leave it blank to duel anonymously.
          </p>
        </div>

        {/* Compact Format Selection Pills */}
        <div>
          <p className="text-sm font-semibold text-ink mb-2.5">
            Select Game Format
          </p>
          <div className="flex flex-wrap gap-2">
            {(['blitz', 'standard', 'classic', 'custom'] as RoomFormat[]).map((f) => {
              const isSelected = format === f

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    'h-9 rounded-lg border px-4 text-xs font-semibold capitalize transition-colors duration-150',
                    isSelected
                      ? 'border-ink bg-ink text-background shadow-xs'
                      : 'border-border bg-background/60 text-muted-foreground hover:border-border/80 hover:bg-background hover:text-ink'
                  )}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Clean Preset Rules Box (If Preset Selected) */}
        {format !== 'custom' && (
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              {FORMAT_PRESETS[format].label} Rules
            </h4>

            <ul className="space-y-1.5 text-xs text-ink">
              {FORMAT_PRESETS[format].rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1 rounded-full bg-marker shrink-0" />
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Custom Game Options Panel (If Custom Selected) */}
        {format === 'custom' && (
          <div className="rounded-xl border border-border bg-background/40 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Custom Settings
              </h4>
              <span className={cn(
                "text-[11px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors duration-200",
                isFormValid ? "bg-secondary text-ink" : "bg-destructive/10 text-destructive"
              )}>
                Questions: {totalCustomQuestions} / 3
              </span>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-ink">Match Duration</label>
                <span className="font-mono font-bold text-ink">{customDuration} min</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="mt-2 w-full accent-ink cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>10 min</span>
                <span>35 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Question Difficulty Counts */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Question Difficulty Counts
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <CountSelector label="Easy" count={easyCount} onChange={setEasyCount} />
                <CountSelector label="Medium" count={mediumCount} onChange={setMediumCount} />
                <CountSelector label="Hard" count={hardCount} onChange={setHardCount} />
              </div>

              {/* Reserved Error/Info Line (Prevents Layout Shift) */}
              <div className="h-5 mt-2.5 flex items-center">
                {!isFormValid ? (
                  <p className="text-xs text-destructive font-semibold flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>Select between 1 and 3 total questions.</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Custom match: {customDuration} min total duration across {totalCustomQuestions} problem(s).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Select Topic Chips */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-sm font-semibold text-ink">
              Topic Filter
            </label>
            <span className="text-xs text-muted-foreground">
              {selectedTopics.length === 0 ? 'Any Topic' : `${selectedTopics.length} selected`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Master All Topics Chip */}
            <button
              type="button"
              onClick={handleSelectAllTopics}
              className={cn(
                'h-8 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5',
                selectedTopics.length === 0
                  ? 'border-ink bg-ink text-background shadow-xs'
                  : 'border-border bg-background/60 text-muted-foreground hover:border-border/80 hover:bg-background hover:text-ink'
              )}
            >
              <Sparkles className="size-3 shrink-0" />
              All Topics
            </button>

            {/* Individual Topic Chips */}
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={cn(
                    'h-8 rounded-full border px-3.5 text-xs font-medium transition-colors duration-150 flex items-center justify-center text-center',
                    isSelected
                      ? 'border-ink bg-ink text-background shadow-xs'
                      : 'border-border bg-background/60 text-muted-foreground hover:border-border/80 hover:bg-background hover:text-ink'
                  )}
                >
                  {topic}
                </button>
              )
            })}
          </div>
        </div>

        {/* Create Button */}
        <button
          type="submit"
          disabled={!isFormValid || isCreating}
          className="group/submit inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_14px_30px_-14px_var(--primary)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none motion-reduce:hover:translate-y-0"
        >
          {isCreating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating room...
            </>
          ) : (
            <>
              Create room
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/submit:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

function CountSelector({
  label,
  count,
  onChange,
}: {
  label: string
  count: number
  onChange: (val: number) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-2.5 text-center">
      <span className="block text-[11px] font-bold text-ink uppercase tracking-wider">{label}</span>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          className="flex size-6 items-center justify-center rounded-md border border-border bg-secondary text-ink font-bold hover:bg-secondary/80 text-xs transition-colors"
        >
          -
        </button>
        <span className="font-mono text-xs font-bold text-ink w-3">{count}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(3, count + 1))}
          className="flex size-6 items-center justify-center rounded-md border border-border bg-secondary text-ink font-bold hover:bg-secondary/80 text-xs transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}
