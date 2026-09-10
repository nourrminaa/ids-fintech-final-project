import { Link } from 'react-router-dom'
import usePageMeta from './usePageMeta'

export default function NotFound() {
  usePageMeta('Page Not Found', 'This page does not exist in the IDS Products Portal.')

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-6 text-center">
      <div>
        <p className="page-header text-6xl mb-4">404</p>
        <p className="text-lg opacity-70 mb-8">We could not find the page you were looking for.</p>
        <Link to="/" className="inline-block px-5 py-3 bg-primary text-white hover:bg-primary-dark transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
