import { useAuth } from '../store/auth';

export type PermissionCode = string;

export function hasPermission(
  user: { permissions?: PermissionCode[] } | null,
  required: PermissionCode | PermissionCode[],
) {
  if (!user || !user.permissions) return false;

  const list = Array.isArray(required) ? required : [required];
  return list.every((perm) => user.permissions!.includes(perm));
}

export function hasAnyPermission(
  user: { permissions?: PermissionCode[] } | null,
  required: PermissionCode[],
) {
  if (!user || !user.permissions) return false;
  return required.some((perm) => user.permissions!.includes(perm));
}

export function usePermission(required: PermissionCode | PermissionCode[]) {
  const user = useAuth((s) => s.user);
  return hasPermission(user, required);
}

export function useAnyPermission(required: PermissionCode[]) {
  const user = useAuth((s) => s.user);
  return hasAnyPermission(user, required);
}
