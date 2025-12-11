import { useAuth } from "../store/auth";

export function useAccess(permission: string) {
  const { user } = useAuth();
  if (!user) return false;

  if (user.role?.type === "admin") return true;

  return user.permissions?.includes(permission) ?? false;
}
