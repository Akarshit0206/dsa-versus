import { Link } from 'react-router'
import { CreateRoomForm } from '@/components/create-room-form'
import { MarkerUnderline } from '@/components/marker-underline'

export function CreateRoomPage() {
  return (
    <div className="relative flex-1 overflow-hidden px-5 py-16 sm:px-8 sm:py-20">
      <img
        src="/doodles/swords.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute right-[4%] top-24 hidden h-auto w-32 rotate-12 opacity-60 lg:block"
      />
      <img
        src="/doodles/graph.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute left-[3%] top-96 hidden h-auto w-40 -rotate-6 opacity-60 lg:block"
      />

      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-12">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Create a{' '}
            <span className="relative inline-block">
              room
              <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-slate-400 dark:text-slate-500" />
            </span>
          </h1>
          <p className="mt-7 text-pretty leading-relaxed text-muted-foreground">
            Choose how the duel runs. We generate a room code you can send to anyone — no
            accounts, no waiting.
          </p>
        </div>

        <CreateRoomForm />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already got a code?{' '}
          <Link to="/join-room" className="font-semibold text-primary underline underline-offset-4">
            Join a room instead
          </Link>
        </p>
      </div>
    </div>
  )
}
