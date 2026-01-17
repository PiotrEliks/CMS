import { useEffect } from 'react'
import React from 'react'

import Badge from '../../ui/badge/Badge'
import Button from '../../ui/button/Button'
import { PencilIcon, TrashBinIcon } from '../../icons'
import { useRoles } from '../../store/roles'
import type { Role } from '../../store/roles'
import { Access } from '../permissions/Access'

type Props = {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export default function RoleTableOne({ onEdit, onDelete }: Props) {
  const { roles, loading, error, fetchRoles } = useRoles()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  if (loading) return <p>Ładowanie…</p>
  if (error) return <p>Błąd: {error}</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Rola
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Status
            </th>
            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.role_id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            >
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {role.display_name}
                </span>
              </td>

              <td className="py-3 px-4">
                <Badge
                  size="sm"
                  color={
                    role.status ? 'success' : !role.status ? 'error' : 'warning'
                  }
                >
                  {role.status ? 'Aktywny' : 'Nieaktywny'}
                </Badge>
              </td>

              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Access allOf={['roles.update']}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(role)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                  </Access>
                  <Access allOf={['roles.delete']}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(role)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </Button>
                  </Access>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
