import { useEffect } from 'react'
import React from 'react'

import Badge from '../../ui/badge/Badge'
import Button from '../../ui/button/Button'
import { PencilIcon, TrashBinIcon } from '../../icons'
import { useUsers } from '../../store/users'
import { formatDate } from '../../utils/formatDate'
import type { User } from '../../store/users'
import { useAuth } from '../../store/auth'
import { Access } from '../permissions/Access'

type Props = {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export default function UserTableOne({ onEdit, onDelete }: Props) {
  const { users, loading, error, fetchUsers } = useUsers()
  const { user: loggedInUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (loading) return <p>Ładowanie…</p>
  if (error) return <p>Błąd: {error}</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Użytkownik
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Rola
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Ostatni dostęp
            </th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.user_id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 overflow-hidden rounded-full">
                    <img
                      width={40}
                      height={40}
                      src={`${import.meta.env.VITE_API_UPLOADS}${user.avatar_url ?? '/uploads/avatars/default-avatar.jpg'}`}
                      alt={user.display_name ?? 'User avatar'}
                    />
                  </div>
                  <div>
                    <span className="block font-medium text-gray-900 dark:text-white">
                      {user.display_name}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </td>

              <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role?.display_name}
                </span>
              </td>

              <td className="py-3 px-4">
                <Badge
                  size="sm"
                  color={
                    user.status ? 'success' : !user.status ? 'error' : 'warning'
                  }
                >
                  {user.status ? 'Aktywny' : 'Nieaktywny'}
                </Badge>
              </td>

              <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.last_access)}
                </span>
              </td>

              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Access allOf={['users.update']}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </Access>
                  {loggedInUser?.user_id !== user.user_id && (
                    <Access allOf={['users.delete']}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </Button>
                    </Access>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
