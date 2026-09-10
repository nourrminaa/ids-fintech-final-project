import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { saveTheme } from '../lib/themeStorage'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    // a manual pick like this is what makes it "explicit", saved against this
    // specific person so it sticks for them next time they log in
    if (user) saveTheme(user.id, next)
  }

  return (
    <button onClick={toggle} aria-label="toggle theme" className="icon-btn w-11 h-11 text-xl">
      <i className={theme === 'dark' ? 'bi bi-sun' : 'bi bi-moon'}></i>
    </button>
  )
}
