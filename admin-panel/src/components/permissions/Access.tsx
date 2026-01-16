import { ReactNode } from 'react'
import { useAuth } from '../../store/auth'
import {
    hasPermission,
    hasAnyPermission,
    type PermissionCode,
} from '../../utils/permissions'

type AccessProps = {
    allOf?: PermissionCode[]
    anyOf?: PermissionCode[]
    children: ReactNode
    fallback?: ReactNode
}

export function Access({
    allOf,
    anyOf,
    children,
    fallback = null,
}: AccessProps) {
    const user = useAuth((s) => s.user)

    let allowed = true

    if (allOf && allOf.length > 0) {
        allowed = hasPermission(user, allOf)
    }

    if (allowed && anyOf && anyOf.length > 0) {
        allowed = hasAnyPermission(user, anyOf)
    }

    return allowed ? <>{children}</> : <>{fallback}</>
}
