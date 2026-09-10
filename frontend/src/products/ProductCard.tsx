import { Link } from 'react-router-dom'
import Badge from '../shared/Badge'
import type { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.id}`} className="flex flex-col h-full border border-border p-6 hover:border-primary transition-colors shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold">{product.name}</h3>
        <Badge status={product.lifecycleStatus} />
      </div>
      <p className="text-sm opacity-70 flex-1">{product.description}</p>
      <div className="flex items-center justify-between text-xs opacity-60 mt-5 pt-4 border-t border-border">
        <span>v{product.currentVersion}</span>
        <span className="text-right">{product.technologies.join(', ')}</span>
      </div>
    </Link>
  )
}
