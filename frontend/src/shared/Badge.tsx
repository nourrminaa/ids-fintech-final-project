// maps a status string to a color, falls back to the border color for unknown values
const statusColors: Record<string, string> = {
  Active: 'var(--color-success)',
  Production: 'var(--color-success)',
  Onboarding: 'var(--color-primary)',
  UAT: 'var(--color-primary)',
  Planned: 'var(--color-accent)',
  Maintenance: 'var(--color-accent)',
  'In Progress': 'var(--color-primary)',
  Inactive: 'var(--color-danger)',
  Deprecated: 'var(--color-danger)',
  Suspended: 'var(--color-danger)',
}

export default function Badge({ status }: { status: string }) {
  const color = statusColors[status] || 'var(--color-border)'

  return (
    <span
      className="inline-flex items-center px-3 py-1 text-sm border"
      style={{ borderColor: color, color }}
    >
      {status}
    </span>
  )
}
