import { useLocation } from 'react-router'
import { SignInForm } from '@/components/auth/signin-form'
import { MarkerUnderline } from '@/components/marker-underline'

export function SignInPage() {
  const location = useLocation()
  const bannerMessage = location.state?.message || null

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
        className="pointer-events-none absolute left-[3%] bottom-24 hidden h-auto w-40 -rotate-6 opacity-60 lg:block"
      />

      <div className="mx-auto w-full max-w-xl">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Welcome{' '}
            <span className="relative inline-block">
              back
              <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-slate-400 dark:text-slate-500" />
            </span>
          </h1>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Sign in to your AlgoDuel account to host battles, join arenas, and track your stats.
          </p>
        </div>

        <SignInForm bannerMessage={bannerMessage} />
      </div>
    </div>
  )
}
