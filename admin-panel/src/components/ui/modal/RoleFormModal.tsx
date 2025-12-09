import React, { useEffect, useState } from 'react';
import { useRoles } from '../../../store/roles';
import type { Role } from '../../../store/roles';
import Button from '../../ui/button/Button';
import { api } from '../../../api/axios';

type Props = {
  open: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
};

export default function RoleFormModal({ open, onClose, roleToEdit }: Props) {
  const isEdit = !!roleToEdit;
  const { addRole, updateRole, loading, error, clearError } = useRoles();

  const [displayName, setDisplayName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState(true);

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchRoles = async () => {
      setRolesLoading(true);
      setRolesError(null);
      try {
        const res = await api.get('/roles');
        setRoles(res.data.roles ?? []);
      } catch (e: any) {
        const msg = e?.response?.data?.error ?? 'Nie udało się pobrać ról';
        setRolesError(msg);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [open]);

  useEffect(() => {
    if (roleToEdit) {
      setDisplayName(roleToEdit.display_name ?? '');
      setRoleId(roleToEdit.role_id ?? '');
      setStatus(roleToEdit.status ?? true);
    } else {
      setDisplayName('');
      setRoleId('');
      setStatus(true);
    }
    clearError();
  }, [roleToEdit, clearError]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && roleToEdit) {
        await updateRole(roleToEdit.role_id, {
          display_name: displayName,
          status,
        });
      } else {
        await addRole({
          display_name: displayName,
          status,
        });
      }
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/60 dark:bg-red-900/40 dark:text-red-100">
            {error}
          </div>
        )}

        {rolesError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-100">
            {rolesError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nazwa wyświetlana <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Określ, czy użytkownik jest aktywny.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus((s) => !s)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                status ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  status ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Anuluj
            </button>

            <Button size="sm" variant="primary" disabled={loading}>
              {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz zmiany' : 'Utwórz użytkownika'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
