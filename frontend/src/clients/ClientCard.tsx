import { Link } from 'react-router-dom'
import Badge from '../shared/Badge'
import type { Client } from '../types'

export default function ClientCard({ client }: { client: Client }) {
  return (
    <Link to={`/clients/${client.id}`} className="flex flex-col h-full border border-border p-6 hover:border-primary transition-colors shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold">{client.companyName}</h3>
        <Badge status={client.status} />
      </div>
      <p className="text-sm opacity-70 flex-1">{client.country}</p>
      <p className="text-xs opacity-60 mt-5 pt-4 border-t border-border">{client.contactInformation}</p>
    </Link>
  )
}
