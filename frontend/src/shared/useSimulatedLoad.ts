import { useEffect, useState } from 'react'

// stands in for a real fetch delay until the .NET API exists, so the
// loading state in every list/details page is real and not just decorative
export default function useSimulatedLoad(delay = 350) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return loading
}
