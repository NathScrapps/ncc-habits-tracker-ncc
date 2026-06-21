import type { AdminUserDto } from '../admin.types'

const ROLE_BADGE: Record<string, string> = {
  PATIENT: 'bg-blue-100 text-blue-700',
  NUTRITIONIST: 'bg-green-100 text-green-700',
  ADMIN: 'bg-purple-100 text-purple-700',
}

interface UserTableProps {
  users: AdminUserDto[]
  isLoading: boolean
}

export function UserTable({ users, isLoading }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400" aria-live="polite">
        Loading users…
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No users found.</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-light-gray text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id} className="bg-white hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">
                {user.fullName ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="px-4 py-3 text-gray-700">{user.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
