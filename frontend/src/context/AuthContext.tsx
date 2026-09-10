import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import * as api from '../lib/api'
import { getSavedTheme } from '../lib/themeStorage'
import { useTheme } from './ThemeContext'

type CurrentUser = {
  id: number
  email: string
  role: 'Employee' | 'Admin'
  teamMemberId: number | null
  fullName: string
}

type AuthContextValue = {
  user: CurrentUser | null
  initializing: boolean // true until we have checked localStorage for a saved session
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const USER_KEY = 'ids_portal_user'

// a JWT's middle segment is base64 encoded JSON with an exp claim (seconds
// since epoch), decoding it client side is just for deciding whether to trust
// a stored session, the backend still checks the real signature on every call
function isTokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [initializing, setInitializing] = useState(true)
  const { setTheme } = useTheme()

  // if this person already picked a theme for themselves, honour it, if not,
  // fall back to the role based default (Admin -> dark, Employee -> light),
  // this runs both on a fresh login and when a saved session is restored
  const applyThemeForUser = (userId: number, role: 'Employee' | 'Admin') => {
    const saved = getSavedTheme(userId)
    setTheme(saved ?? (role === 'Admin' ? 'dark' : 'light'))
  }

  // on first load, restore whatever session was saved last time, so a page
  // refresh does not just dump the person back to the login screen
  useEffect(() => {
    const token = api.getToken()
    const savedUser = localStorage.getItem(USER_KEY)

    if (token && savedUser && !isTokenExpired(token)) {
      const restoredUser: CurrentUser = JSON.parse(savedUser)
      setUser(restoredUser)
      applyThemeForUser(restoredUser.id, restoredUser.role)
    } else {
      api.clearToken()
      localStorage.removeItem(USER_KEY)
    }

    setInitializing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password)
      const currentUser: CurrentUser = {
        id: response.id,
        email: response.email,
        role: response.role,
        teamMemberId: response.teamMemberId,
        fullName: response.fullName,
      }

      api.setToken(response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser))
      setUser(currentUser)
      applyThemeForUser(currentUser.id, currentUser.role)

      return { ok: true }
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : 'Could not reach the server'
      return { ok: false, error: message }
    }
  }

  const logout = () => {
    api.clearToken()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
