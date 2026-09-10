import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../shared/Button'
import usePageMeta from '../shared/usePageMeta'

export default function Login() {
  usePageMeta('Log In', 'Sign in to the IDS Products Portal to view products, clients and deployments.')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      return
    }

    const result = await login(email, password)
    if (!result.ok) {
      setError(result.error || 'Could not sign in')
      return
    }

    setError('')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="page-header text-4xl mb-2">IDS Products Portal</h1>
        <p className="opacity-60 mb-10 text-base">Sign in to view products and clients</p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-base mb-2 font-bold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-transparent border outline-none focus:border-primary text-base ${error ? 'border-danger' : 'border-border'}`}
              placeholder="e.g. admin@idsfintech.com"
              aria-invalid={!!error}
            />
          </div>

          <div>
            <label className="block text-base mb-2 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-transparent border outline-none focus:border-primary text-base ${error ? 'border-danger' : 'border-border'}`}
              placeholder="password"
              aria-invalid={!!error}
            />
          </div>

          {error && <p className="text-danger text-sm" role="alert">{error}</p>}

          <Button type="submit">Log in</Button>
        </form>
      </div>
    </div>
  )
}
