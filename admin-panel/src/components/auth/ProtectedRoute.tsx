import { Navigate } from 'react-router-dom'
import { useAuth } from '../../store/auth'
import type { JSX } from 'react'

type Props = { children: JSX.Element }

export default function ProtectedRoute({ children }: Props) {
    const { user, loading } = useAuth()

    if (loading) return <div style={{ padding: 24 }}>Ładowanie…</div>
    if (!user) return <Navigate to="/login" replace />
    return children
}
