import { create } from 'zustand'
import { api } from '../api/axios'
import { useAlerts, type AlertPayload } from './alerts'

export type Role = {
  role_id: string
  display_name: string
  type?: string
  created_at?: string
  updated_at?: string
  status?: boolean
}

export type Permission = {
  permission_id: string
  code: string
  description?: string
}

export type NewRolePayload = {
  display_name: string
  type?: string
  status?: boolean
  permissions?: string[]
}

export type UpdateRolePayload = {
  display_name?: string
  type?: string
  status?: boolean
  permissions?: string[]
}

type RolesState = {
  roles: Role[]
  selectedRole: Role | null
  loading: boolean
  error: string | null

  allPermissions: Permission[]
  rolePermissions: string[]

  fetchRoles: () => Promise<void>
  fetchRole: (id: string) => Promise<void>
  addRole: (data: NewRolePayload) => Promise<Role>
  updateRole: (id: string, data: UpdateRolePayload) => Promise<Role>
  deleteRole: (id: string) => Promise<void>

  fetchAllPermissions: () => Promise<void>
  fetchRolePermissions: (roleId: string) => Promise<void>
  updateRolePermissions: (
    roleId: string,
    permissionIds: string[]
  ) => Promise<void>

  clearError: () => void
  clearSelected: () => void
}

const showAlert = (payload: AlertPayload) => {
  useAlerts.getState().showAlert(payload)
}

export const useRoles = create<RolesState>((set, get) => ({
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,

  allPermissions: [],
  rolePermissions: [],

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedRole: null, rolePermissions: [] }),

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/roles')
      set({ roles: res.data.roles ?? [], loading: false })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać ról'
      set({ error: msg, loading: false })
      throw e
    }
  },

  fetchRole: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/roles/${id}`)
      set({ selectedRole: res.data.role ?? null, loading: false })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać roli'
      set({ error: msg, loading: false })
      throw e
    }
  },

  addRole: async (data: NewRolePayload) => {
    set({ loading: true, error: null })
    try {
      const res = await api.post('/roles', data)
      const created: Role = res.data.role
      const current = get().roles
      set({ roles: [...current, created], loading: false })
      showAlert({
        variant: 'success',
        title: 'Dodano rolę',
        message: 'Rola została pomyślnie dodana.',
        duration: 3000,
      })
      return created
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się dodać roli'
      set({ error: msg, loading: false })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  updateRole: async (id: string, data: UpdateRolePayload) => {
    set({ loading: true, error: null })
    try {
      const res = await api.put(`/roles/${id}`, data)
      const updated: Role = res.data.role

      const current = get().roles
      set({
        roles: current.map((r) => (r.role_id === id ? updated : r)),
        loading: false,
      })

      showAlert({
        variant: 'success',
        title: 'Zaktualizowano rolę',
        message: 'Dane roli zostały pomyślnie zaktualizowane.',
        duration: 3000,
      })

      return updated
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się zaktualizować roli'
      set({ error: msg, loading: false })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  deleteRole: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/roles/${id}`)

      const current = get().roles
      set({
        roles: current.filter((r) => r.role_id !== id),
        loading: false,
      })
      showAlert({
        variant: 'success',
        title: 'Usunięto rolę',
        message: 'Rola została pomyślnie usunięta.',
        duration: 3000,
      })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się usunąć roli'
      set({ error: msg, loading: false })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  fetchAllPermissions: async () => {
    try {
      const res = await api.get('/permissions')
      set({ allPermissions: res.data.permissions ?? [] })
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? 'Nie udało się pobrać uprawnień'
      set({ error: msg })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  fetchRolePermissions: async (roleId: string) => {
    try {
      const res = await api.get(`/roles/${roleId}/permissions`)
      const ids: string[] =
        res.data.permissions?.map((p: Permission) => p.permission_id) ?? []
      set({ rolePermissions: ids })
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ?? 'Nie udało się pobrać uprawnień roli'
      set({ error: msg })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },

  updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
    try {
      await api.put(`/roles/${roleId}/permissions`, {
        permissions: permissionIds,
      })
      set({ rolePermissions: permissionIds })
      showAlert({
        variant: 'success',
        title: 'Zaktualizowano uprawnienia',
        message: 'Uprawnienia roli zostały zapisane.',
        duration: 3000,
      })
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ?? 'Nie udało się zaktualizować uprawnień roli'
      set({ error: msg })
      showAlert({
        variant: 'error',
        title: 'Błąd',
        message: msg,
        duration: 5000,
      })
      throw e
    }
  },
}))
