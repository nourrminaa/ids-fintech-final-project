import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { DashboardSummary } from '../types'
import Badge from '../shared/Badge'
import usePageMeta from '../shared/usePageMeta'
import LoadingState from '../shared/LoadingState'

export default function Dashboard() {
  usePageMeta('Dashboard', 'An overview of every product, client and deployment IDS Fintech tracks in one place.')

  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboardSummary().then(setSummary).finally(() => setLoading(false))
  }, [])

  const greeting = user?.role === 'Admin' ? 'Hello there, Admin.' : 'Welcome back!'

  if (loading || !summary) return <LoadingState label="Loading your dashboard" />

  const stats = [
    { label: 'Total Products', value: summary.totalProducts, to: '/products' },
    { label: 'Active Products', value: summary.activeProducts, to: '/products' },
    { label: 'Total Clients', value: summary.totalClients, to: '/clients' },
    { label: 'Total Deployments', value: summary.totalDeployments, to: '/deployments' },
    { label: 'Team Members', value: summary.totalTeamMembers, to: '/team' },
  ]

  return (
    <div>
      <p className="text-lg opacity-60 mb-1">{greeting}</p>
      <h1 className="page-header text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-12">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="border border-border p-6 hover:border-primary transition-colors shadow-sm">
            <p className="text-4xl font-extrabold">{s.value}</p>
            <p className="text-sm opacity-60 mt-2">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-base font-bold opacity-70 mb-4">Recently Updated Products</h2>
          <div className="divide-y divide-border border-t border-b border-border">
            {summary.recentlyUpdatedProducts.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between py-4 text-base hover:text-primary">
                <span>{p.name}</span>
                <Badge status={p.lifecycleStatus} />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold opacity-70 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/products" className="flex items-center gap-2 whitespace-nowrap border border-border p-6 hover:border-primary transition-colors text-base">
              <i className="bi bi-box-seam"></i>Products
            </Link>
            <Link to="/clients" className="flex items-center gap-2 whitespace-nowrap border border-border p-6 hover:border-primary transition-colors text-base">
              <i className="bi bi-building"></i>Clients
            </Link>
            <Link to="/deployments" className="flex items-center gap-2 whitespace-nowrap border border-border p-6 hover:border-primary transition-colors text-base">
              <i className="bi bi-diagram-3"></i>Deployments
            </Link>
            <Link to="/team" className="flex items-center gap-2 whitespace-nowrap border border-border p-6 hover:border-primary transition-colors text-base">
              <i className="bi bi-people"></i>Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
