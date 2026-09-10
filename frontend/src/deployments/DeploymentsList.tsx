import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import * as api from '../lib/api'
import type { DeploymentListItem } from '../types'
import Badge from '../shared/Badge'
import EmptyState from '../shared/EmptyState'
import usePageMeta from '../shared/usePageMeta'
import LoadingState from '../shared/LoadingState'

export default function DeploymentsList() {
  usePageMeta('Deployments', 'Every product deployment across IDS Fintech clients, filterable by product, client and status.')

  // products/clients only needed for the filter dropdowns, the deployments
  // themselves are fetched fresh below, filtered server side
  const { products, clients } = useData()
  const [deployments, setDeployments] = useState<DeploymentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState('')
  const [clientId, setClientId] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .getDeployments({
        productId: productId ? Number(productId) : undefined,
        clientId: clientId ? Number(clientId) : undefined,
        status: status || undefined,
      })
      .then(setDeployments)
      .finally(() => setLoading(false))
  }, [productId, clientId, status])

  if (loading && deployments.length === 0) return <LoadingState label="Loading deployments" />

  return (
    <div>
      <h1 className="page-header text-3xl mb-6">Deployments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full">
          <option value="">All products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full">
          <option value="">All clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-3 bg-bg border border-border outline-none focus:border-primary text-base w-full">
          <option value="">All statuses</option>
          <option value="Production">Production</option>
          <option value="UAT">UAT</option>
          <option value="In Progress">In Progress</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {deployments.length === 0 ? (
        <EmptyState message="No deployments match your filters." />
      ) : (
        <div className="border-t border-border">
          {deployments.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-5 border-b border-border text-base">
              <div>
                <p>
                  <Link to={`/products/${d.productId}`} className="hover:text-primary">{d.productName}</Link>
                  <span className="opacity-50"> for </span>
                  <Link to={`/clients/${d.clientId}`} className="hover:text-primary">{d.clientName}</Link>
                </p>
                <p className="text-xs opacity-60 mt-1">
                  v{d.productVersion}, go live {d.goLiveDate || 'not set'}
                </p>
              </div>
              <Badge status={d.deploymentStatus} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
