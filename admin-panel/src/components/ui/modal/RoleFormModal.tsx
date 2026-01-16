import React, { useEffect, useState } from 'react'
import { useRoles } from '../../../store/roles'
import type { Role } from '../../../store/roles'
import Button from '../../ui/button/Button'

type Props = {
    open: boolean
    onClose: () => void
    roleToEdit?: Role | null
}

export default function RoleFormModal({ open, onClose, roleToEdit }: Props) {
    const isEdit = !!roleToEdit

    const {
        addRole,
        updateRole,
        loading,
        error,
        clearError,
        allPermissions,
        rolePermissions,
        fetchAllPermissions,
        fetchRolePermissions,
        updateRolePermissions,
    } = useRoles()

    const [displayName, setDisplayName] = useState('')
    const [status, setStatus] = useState(true)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [permissionsLoading, setPermissionsLoading] = useState(false)

    useEffect(() => {
        if (!open) return

        clearError()

        if (roleToEdit) {
            setDisplayName(roleToEdit.display_name ?? '')
            setStatus(roleToEdit.status ?? true)

            const loadPerms = async () => {
                setPermissionsLoading(true)
                try {
                    await fetchAllPermissions()
                    await fetchRolePermissions(roleToEdit.role_id)
                } finally {
                    setPermissionsLoading(false)
                }
            }

            loadPerms()
        } else {
            setDisplayName('')
            setStatus(true)
            setSelectedPermissions([])
            const loadPerms = async () => {
                setPermissionsLoading(true)
                try {
                    await fetchAllPermissions()
                } finally {
                    setPermissionsLoading(false)
                }
            }
            loadPerms()
        }
    }, [
        open,
        roleToEdit,
        clearError,
        fetchAllPermissions,
        fetchRolePermissions,
    ])

    useEffect(() => {
        if (open && roleToEdit) {
            setSelectedPermissions(rolePermissions)
        }
    }, [rolePermissions, open, roleToEdit])

    if (!open) return null

    const togglePermission = (id: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        clearError()

        try {
            if (isEdit && roleToEdit) {
                const updated = await updateRole(roleToEdit.role_id, {
                    display_name: displayName,
                    status,
                })

                await updateRolePermissions(
                    updated.role_id,
                    selectedPermissions
                )
            } else {
                const created = await addRole({
                    display_name: displayName,
                    status,
                    permissions: selectedPermissions,
                })
            }

            onClose()
        } catch {}
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isEdit ? 'Edytuj rolę' : 'Dodaj nową rolę'}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Określ nazwę roli i przypisz jej odpowiednie
                            uprawnienia.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/60 dark:bg-red-900/40 dark:text-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nazwa roli{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Np. Administrator, Moderator"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Status roli
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Nieaktywna rola nie będzie mogła być
                                    przypisana nowym użytkownikom.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStatus((s) => !s)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                    status
                                        ? 'bg-brand-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                        status
                                            ? 'translate-x-5'
                                            : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    Uprawnienia roli
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Zaznacz, do jakich akcji ta rola powinna
                                    mieć dostęp.
                                </p>
                            </div>
                        </div>

                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-100 p-3 text-sm dark:border-gray-800">
                            {permissionsLoading ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Ładowanie uprawnień…
                                </p>
                            ) : allPermissions.length === 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Brak zdefiniowanych uprawnień w systemie.
                                </p>
                            ) : (
                                allPermissions.map((perm) => (
                                    <label
                                        key={perm.permission_id}
                                        className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
                                            checked={selectedPermissions.includes(
                                                perm.permission_id
                                            )}
                                            onChange={() =>
                                                togglePermission(
                                                    perm.permission_id
                                                )
                                            }
                                        />
                                        <div>
                                            <span className="font-mono text-xs text-gray-800 dark:text-gray-100">
                                                {perm.code}
                                            </span>
                                            {perm.description && (
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    {perm.description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Anuluj
                        </button>

                        <Button
                            size="sm"
                            variant="primary"
                            disabled={loading || permissionsLoading}
                        >
                            {loading || permissionsLoading
                                ? 'Zapisywanie...'
                                : isEdit
                                  ? 'Zapisz zmiany'
                                  : 'Utwórz rolę'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
