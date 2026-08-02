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
  const [secondsLeft, setSecondsLeft] = useState(154)
  const [opponentTests, setOpponentTests] = useState(12)

  useEffect(() => {
    if (reduceMotion) {
      setTyped(fullText.length)
      return
    }
    let index = 0
    let hold = 0
    const id = window.setInterval(() => {
      if (index >= fullText.length) {
        hold += 1
        if (hold > 50) {
          index = 0
          hold = 0
          setTyped(0)
        }
        return
      }
      index = Math.min(index + 2, fullText.length)
      setTyped(index)
    }, 70)
    return () => window.clearInterval(id)
  }, [fullText.length, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 154 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setOpponentTests((prev) => (prev >= TOTAL_TESTS - 1 ? 12 : prev + 1))
    }, 3500)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  const visibleText = fullText.slice(0, typed)
  const yourTests = Math.round((typed / fullText.length) * TOTAL_TESTS)
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Window Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          <span className="size-2.5 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
          <span className="ml-3 font-mono text-xs text-slate-500">room /</span>
          <CopyCodeButton code={ROOM_CODE} />
        </div>
        <span className="hidden font-mono text-xs text-slate-400 sm:inline">1v1 DSA Arena</span>
      </div>

      <div className="relative z-10 grid gap-px bg-slate-200/80 sm:grid-cols-2 dark:bg-slate-800/80">
        <PlayerPane
          name="YOU"
          status="Solution"
          statusTone="active"
          code={visibleText}
          caret={!reduceMotion}
          tests={yourTests}
          doodle="/doodles/linked-list.png"
          doodleClass="-bottom-10 -right-8 h-40 w-40"
          tilt="-8deg"
        />
        <PlayerPane
          name="OPPONENT"
          status={`${opponentTests} / ${TOTAL_TESTS} tests passing`}
          statusTone="muted"
          code={OPPONENT_LINES.join('\n')}
          tests={opponentTests}
          doodle="/doodles/time-complexity.png"
          doodleClass="-bottom-8 -right-10 h-36 w-52"
          tilt="4deg"
        />
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-slate-50/60 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-slate-700 dark:bg-slate-300" />
          <p className="text-xs font-semibold text-slate-800 sm:text-sm dark:text-slate-200">Two Sum · Easy</p>
        </div>
        <p className="font-mono text-xs tabular-nums text-slate-500 sm:text-sm">
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
      // Ignore
    }
    setCopied(true)
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group/copy cursor-pointer relative inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-800 transition-all hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      {code}
      {copied ? (
        <Check className="size-3 text-slate-700 dark:text-slate-300" aria-hidden="true" />
      ) : (
        <Copy
          className="size-3 text-slate-400 transition-transform group-hover/copy:scale-105"
          aria-hidden="true"
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
  statusTone: 'active' | 'muted'
  code: string
  caret?: boolean
  tests: number
  doodle: string
  doodleClass: string
  tilt: string
}) {
  return (
    <div className="group relative overflow-hidden bg-white p-6 transition-colors duration-300 dark:bg-slate-900">
      <DoodleBackdrop
        src={doodle}
        className={doodleClass}
        tilt={tilt}
        opacity="opacity-[0.03]"
        hoverOpacity="group-hover:opacity-[0.06]"
      />

      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
            {name}
          </p>
          <p className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400">
            {status}
          </p>
        </div>

        {/* Thick Slate Gray progress bar */}
        <div
          className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={tests}
          aria-valuemin={0}
          aria-valuemax={TOTAL_TESTS}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-500 ease-out',
              statusTone === 'active' ? 'bg-slate-700 dark:bg-slate-300' : 'bg-slate-600 dark:bg-slate-400',
            )}
            style={{ width: `${(tests / TOTAL_TESTS) * 100}%` }}
          />
        </div>

        {/* Fixed height code container (h-44) to prevent card resizing during typing */}
        <pre className="h-44 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-600 transition-colors group-hover:text-slate-900 sm:text-xs dark:text-slate-400 dark:group-hover:text-slate-100">
          <code>
            {code}
            {caret && (
              <span
                aria-hidden="true"
                className="animate-caret ml-px inline-block h-3.5 w-1.5 translate-y-px bg-slate-800 dark:bg-slate-200 align-middle"
              />
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}
