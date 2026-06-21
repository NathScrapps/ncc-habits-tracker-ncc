import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useLogout } from '@/features/auth/hooks/use-logout'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const { mutate: logout, isPending } = useLogout()

  return (
    <div className="min-h-screen bg-light-gray">
      <header className="bg-deep-purple px-4 py-4 shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-lavender">Habit Tracker</span>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-lavender/70 sm:block">{user?.email}</span>
            <button
              onClick={() => logout()}
              disabled={isPending}
              className="rounded-lg border border-lavender/30 px-3 py-1.5 text-xs font-medium text-lavender transition hover:bg-lavender/10 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}
