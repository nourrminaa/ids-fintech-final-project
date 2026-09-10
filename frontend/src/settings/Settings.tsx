import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { saveTheme } from '../lib/themeStorage'
import usePageMeta from '../shared/usePageMeta'

export default function Settings() {
  usePageMeta('Settings', 'Manage your account details and choose a light or dark appearance for the portal.')

  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const handleSetTheme = (t: 'light' | 'dark') => {
    setTheme(t)
    if (user) saveTheme(user.id, t)
  }

  return (
    <div className="max-w-xl">
      <h1 className="page-header text-3xl mb-8">Settings</h1>

      <div className="border border-border p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Account</h2>
        <dl className="space-y-2 text-base">
          <div className="flex justify-between">
            <dt className="opacity-60">Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="opacity-60">Role</dt>
            <dd>{user?.role}</dd>
          </div>
        </dl>
      </div>

      <div className="border border-border p-6">
        <h2 className="text-lg font-bold mb-2">Appearance</h2>
        <p className="text-sm opacity-60 mb-5">
          Choose how the portal looks for you. Employees start on light and admins start on dark,
          but whatever you pick here is remembered from now on.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSetTheme('light')}
            className={`border p-5 text-left transition-colors ${theme === 'light' ? 'border-primary' : 'border-border hover:border-primary'}`}
          >
            <i className="bi bi-sun text-2xl mb-3 block"></i>
            <p className="font-bold">Light</p>
            {theme === 'light' && <p className="text-xs text-primary mt-1">Currently active</p>}
          </button>

          <button
            onClick={() => handleSetTheme('dark')}
            className={`border p-5 text-left transition-colors ${theme === 'dark' ? 'border-primary' : 'border-border hover:border-primary'}`}
          >
            <i className="bi bi-moon text-2xl mb-3 block"></i>
            <p className="font-bold">Dark</p>
            {theme === 'dark' && <p className="text-xs text-primary mt-1">Currently active</p>}
          </button>
        </div>
      </div>
    </div>
  )
}
