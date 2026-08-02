import { SignUpForm } from '@/components/auth/signup-form'
import { MarkerUnderline } from '@/components/marker-underline'

export function SignUpPage() {
  return (
    <div className="relative flex-1 overflow-hidden px-5 py-16 sm:px-8 sm:py-20">
      <img
        src="/doodles/time-complexity.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute right-[4%] top-24 hidden h-auto w-40 rotate-6 opacity-60 lg:block"
      />
      <img
        src="/doodles/bst.png"
        alt=""
        aria-hidden="true"
        width={320}
        height={320}
        className="pointer-events-none absolute left-[3%] bottom-24 hidden h-auto w-36 -rotate-12 opacity-60 lg:block"
      />

      <div className="mx-auto w-full max-w-xl">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Join the{' '}
            <span className="relative inline-block">
              arena
              <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-slate-400 dark:text-slate-500" />
            </span>
          </h1>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Create an account to host rooms, compete against friends in real-time, and rank up.
          </p>
        </div>

        <SignUpForm />
      </div>
    </div>
  )
}
