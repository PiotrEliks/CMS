import { useEffect } from 'react';
import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';

import Badge from '../../ui/badge/Badge';
import { useRoles } from '../../store/roles';
import type { Role } from '../../store/roles';
import { useAuth } from '../../store/auth';

type Props = {
  onEdit: (user: Role) => void;
  onDelete: (user: Role) => void;
};

export default function RoleTableOne({ onEdit, onDelete }: Props) {
  const { roles, loading, error, fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  if (loading) return <p>Ładowanie…</p>;
  if (error) return <p>Błąd: {error}</p>;

  return (
    <div className="overflow-hidden rounded-xl buser buser-gray-200 bg-white dark:buser-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="buser-b buser-gray-100 dark:buser-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Rola
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Akcje
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {roles.map((role) => (
              <TableRow key={role.role_id}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {role.display_name}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={role.status ? 'success' : !role.status ? 'error' : 'warning'}
                  >
                    {role.status ? 'Aktywny' : 'Nieaktywny'}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="flex items-center justify-center gap-2 rounded-full buser buser-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:buser-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                          fill=""
                        />
                      </svg>
                      Edytuj
                    </button>

                    <button
                      onClick={() => onDelete(role)}
                      className="flex items-center justify-center gap-2 rounded-full buser buser-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 shadow-theme-xs hover:bg-red-100 hover:text-red-700 dark:buser-red-900/60 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/60"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current"
                      >
                        <path d="M4 7H20" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M10 11V17" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M14 11V17" strokeWidth="1.8" strokeLinecap="round" />
                        <path
                          d="M6 7L7 19C7.06676 19.7442 7.40241 20.4437 7.93853 20.9449C8.47466 21.4461 9.17694 21.7127 9.9 21.7H14.1C14.8231 21.7127 15.5253 21.4461 16.0615 20.9449C16.5976 20.4437 16.9332 19.7442 17 19L18 7"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 7V5C9 4.73478 9.10536 4.48043 9.29289 4.29289C9.48043 4.10536 9.73478 4 10 4H14C14.2652 4 14.5196 4.10536 14.7071 4.29289C14.8946 4.48043 15 4.73478 15 5V7"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Usuń
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
