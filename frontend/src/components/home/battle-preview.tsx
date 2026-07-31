import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { DoodleBackdrop } from '@/components/doodle-backdrop'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

const ROOM_CODE = '8FK2QX'

const YOUR_LINES = [
  'function twoSum(nums, target) {',
  '  const seen = new Map()',
  '  for (let i = 0; i < nums.length; i++) {',
  '    const need = target - nums[i]',
  '    if (seen.has(need)) return [seen.get(need), i]',
  '    seen.set(nums[i], i)',
  '  }',
  '}',
]

const OPPONENT_LINES = [
  'def two_sum(nums, target):',
  '    for i in range(len(nums)):',
  '        for j in range(i + 1, len(nums)):',
  '            if nums[i] + nums[j] == target:',
  '                return [i, j]',
  '    return []',
]

const TOTAL_TESTS = 18

export function BattlePreview() {
  const reduceMotion = usePrefersReducedMotion()
  const fullText = useMemo(() => YOUR_LINES.join('\n'), [])

  const [typed, setTyped] = useState(reduceMotion ? fullText.length : 0)
  const [secondsLeft, setSecondsLeft] = useState(271)
  const [opponentTests, setOpponentTests] = useState(12)

  // Typewriter loop for the local player's editor.
  useEffect(() => {
    if (reduceMotion) {
      setTyped(fullText.length)
      return
    }
    let index = 0
    let hold = 0
    const id = window.setInterval(() => {
      if (index >= fullText.length) {
        // Hold the finished snippet for ~2s, then retype from the top.
        hold += 1
        if (hold > 40) {
          index = 0
          hold = 0
          setTyped(0)
        }
        return
      }
      index = Math.min(index + 2, fullText.length)
      setTyped(index)
    }, 50)
    return () => window.clearInterval(id)
  }, [fullText.length, reduceMotion])

  // Countdown clock.
  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 271 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  // Opponent creeps up the test list, then stalls and restarts.
  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setOpponentTests((prev) => (prev >= TOTAL_TESTS - 1 ? 12 : prev + 1))
    }, 2300)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  const visibleText = fullText.slice(0, typed)
  const yourTests = Math.round((typed / fullText.length) * TOTAL_TESTS)
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const urgent = secondsLeft < 60

  return (
    <div className="glass-strong relative overflow-hidden rounded-xl">
      {/* Window chrome */}
      <div className="relative z-10 flex items-center gap-2 border-b border-border/70 bg-secondary/40 px-4 py-3">
        <span className="size-2.5 rounded-full bg-border" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-border" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-border" aria-hidden="true" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">room /</span>
        <CopyCodeButton code={ROOM_CODE} />
      </div>

      <div className="relative z-10 grid gap-px bg-border/70 sm:grid-cols-2">
        <PlayerPane
          name="you"
          status="Solving"
          statusTone="marker"
          code={visibleText}
          caret={!reduceMotion}
          tests={yourTests}
          doodle="/doodles/linked-list.png"
          doodleClass="-bottom-10 -right-8 h-40 w-40"
          tilt="-8deg"
        />
        <PlayerPane
          name="opponent"
          status={`${opponentTests} / ${TOTAL_TESTS} tests passing`}
          statusTone="muted"
          code={OPPONENT_LINES.join('\n')}
          tests={opponentTests}
          doodle="/doodles/time-complexity.png"
          doodleClass="-bottom-8 -right-10 h-36 w-52"
          tilt="4deg"
        />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4">
        <p className="text-sm font-medium text-ink">Two Sum · Easy</p>
        <p
          className={cn(
            'font-mono text-sm tabular-nums transition-colors',
            urgent ? 'text-marker' : 'text-muted-foreground',
          )}
        >
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')} left
        </p>
      </div>
    </div>
  )
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const timeout = useRef<number | null>(null)

  useEffect(() => () => {
    if (timeout.current) window.clearTimeout(timeout.current)
  }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Clipboard can be blocked; still give the affordance feedback.
    }
    setCopied(true)
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group/copy relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-transparent px-2 py-1 font-mono text-xs text-ink transition-colors hover:border-border hover:bg-background/70"
    >
      {code}
      {copied ? (
        <Check className="size-3 text-marker" aria-hidden="true" />
      ) : (
        <Copy
          className="size-3 text-muted-foreground transition-transform group-hover/copy:-translate-y-px group-hover/copy:text-ink"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">{copied ? 'Room code copied' : 'Copy room code'}</span>
      {copied && (
        <span
          aria-hidden="true"
          className="animate-sheen absolute inset-y-0 w-1/3 bg-marker/20 blur-sm"
        />
      )}
    </button>
  )
}

function PlayerPane({
  name,
  status,
  statusTone,
  code,
  caret = false,
  tests,
  doodle,
  doodleClass,
  tilt,
}: {
  name: string
  status: string
  statusTone: 'marker' | 'muted'
  code: string
  caret?: boolean
  tests: number
  doodle: string
  doodleClass: string
  tilt: string
}) {
  return (
    <div className="group relative overflow-hidden bg-card/70 p-5 transition-colors duration-300 hover:bg-card">
      <DoodleBackdrop
        src={doodle}
        className={doodleClass}
        tilt={tilt}
        opacity="opacity-[0.07]"
        hoverOpacity="group-hover:opacity-[0.14]"
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink">
            {name}
          </p>
          <p
            className={cn(
              'text-xs font-medium tabular-nums transition-colors',
              statusTone === 'marker' ? 'text-marker' : 'text-muted-foreground',
            )}
          >
            {status}
          </p>
        </div>

        {/* Test-case progress */}
        <div
          className="mb-4 h-1 w-full overflow-hidden rounded-full bg-border/70"
          role="progressbar"
          aria-valuenow={tests}
          aria-valuemin={0}
          aria-valuemax={TOTAL_TESTS}
          aria-label={`${name} test cases passing`}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-700 ease-out',
              statusTone === 'marker' ? 'bg-marker' : 'bg-primary',
            )}
            style={{ width: `${(tests / TOTAL_TESTS) * 100}%` }}
          />
        </div>

        <pre className="min-h-[9.5rem] overflow-x-auto font-mono text-[11px] leading-relaxed text-muted-foreground transition-colors group-hover:text-ink/80 sm:text-xs">
          <code>
            {code}
            {caret && (
              <span
                aria-hidden="true"
                className="animate-caret ml-px inline-block h-3 w-1.5 translate-y-px bg-marker align-middle"
              />
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}
