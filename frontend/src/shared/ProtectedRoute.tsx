import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingState from './LoadingState'

export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, initializing } = useAuth()

  // still checking localStorage for a saved session, do not redirect to
  // login yet or a real refresh would always flash the login page first
  if (initializing) return <LoadingState label="Loading" />

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" replace />

  return <>{children}</>
}
