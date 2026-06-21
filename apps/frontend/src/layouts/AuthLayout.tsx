import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light-gray px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-deep-purple">
            <span className="text-2xl text-lavender">H</span>
          </div>
          <h1 className="text-2xl font-bold text-deep-purple">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-10 shadow-md">{children}</div>
      </div>
    </div>
  )
}
