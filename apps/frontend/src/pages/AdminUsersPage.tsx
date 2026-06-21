import { useState } from 'react'
import { CreateUserForm } from '@/features/admin/components/CreateUserForm'
import { UserTable } from '@/features/admin/components/UserTable'
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users'
import { useCreateAdminUser } from '@/features/admin/hooks/use-create-admin-user'
import { useLogout } from '@/features/auth/hooks/use-logout'
import type { CreateUserFormValues } from '@/features/admin/admin.schemas'
import type { UserRole } from '@/features/auth/auth.types'

type Tab = 'users' | 'create'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'users', label: 'Users' },
  { id: 'create', label: 'New user' },
]

const ROLE_OPTIONS: Array<{ label: string; value: UserRole | '' }> = [
  { label: 'All roles', value: '' },
  { label: 'Patient', value: 'PATIENT' },
  { label: 'Nutritionist', value: 'NUTRITIONIST' },
  { label: 'Admin', value: 'ADMIN' },
]

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const { data: users = [], isLoading } = useAdminUsers(roleFilter || undefined)
  const { mutate: createUser, isPending, error, reset } = useCreateAdminUser()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const createError =
    error instanceof Error ? error.message : error ? 'Failed to create user' : null

  const handleCreate = (data: CreateUserFormValues) => {
    createUser(
      { email: data.email, password: data.password, role: data.role, fullName: data.fullName },
      { onSuccess: () => setActiveTab('users') },
    )
  }

  const handleTabChange = (tab: Tab) => {
    reset()
    setActiveTab(tab)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-deep-purple">User management</h1>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {/* Nav pills */}
      <div className="mb-6 flex gap-1 rounded-xl bg-light-gray p-1" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-deep-purple shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.id === 'users' && !isLoading && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">({users.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div
        id="panel-users"
        role="tabpanel"
        aria-labelledby="tab-users"
        hidden={activeTab !== 'users'}
      >
        <div className="mb-4 flex items-center justify-end">
          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-lavender"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <UserTable users={users} isLoading={isLoading} />
      </div>

      <div
        id="panel-create"
        role="tabpanel"
        aria-labelledby="tab-create"
        hidden={activeTab !== 'create'}
      >
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <CreateUserForm onSubmit={handleCreate} isPending={isPending} error={createError} />
        </div>
      </div>
    </div>
  )
}
