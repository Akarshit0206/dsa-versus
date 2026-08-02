import { Link } from 'react-router'
import { JoinRoomForm } from '@/components/join-room-form'
import { MarkerUnderline } from '@/components/marker-underline'

const TIPS = [
  'Codes are six characters and never case-sensitive.',
  'You can paste the whole code into the first box.',
  'Rooms stay open until the host closes them.',
]

export function JoinRoomPage() {
  return (
    <div className="relative flex-1 overflow-hidden px-5 py-16 sm:px-8 sm:py-20">
      <img
        src="/doodles/linked-list.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute left-[2%] top-28 hidden h-auto w-44 -rotate-12 opacity-60 lg:block"
      />
      <img
        src="/doodles/bst.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute right-[2%] bottom-20 hidden h-auto w-40 rotate-6 opacity-60 lg:block"
      />

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-12">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Join a{' '}
            <span className="relative inline-block">
              duel
              <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-slate-400 dark:text-slate-500" />
            </span>
          </h1>
          <p className="mt-7 text-pretty leading-relaxed text-muted-foreground">
            Drop in the room code your opponent shared and you will land in the lobby right away.
          </p>
        </div>

        <JoinRoomForm />

        <ul className="mt-10 grid gap-3">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          No code yet?{' '}
          <Link to="/create-room" className="font-semibold text-primary underline underline-offset-4">
            Create your own room
          </Link>
        </p>
      </div>
    </div>
  )
}
