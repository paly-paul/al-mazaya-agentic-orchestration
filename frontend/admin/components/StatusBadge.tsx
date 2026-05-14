interface StatusBadgeProps {
  status: string
}

function getStatusStyle(status: string): string {
  const s = status?.toLowerCase() || ''
  if (['active', 'completed', 'in_progress', 'resolved', 'approved'].includes(s)) {
    return 'bg-green-100 text-green-700'
  }
  if (['pending', 'onboarding', 'warning', 'warm', 'open', 'quoted'].includes(s)) {
    return 'bg-amber-100 text-amber-700'
  }
  if (['critical', 'suspended', 'overdue', 'rejected', 'hot'].includes(s)) {
    return 'bg-red-100 text-red-700'
  }
  if (['cold', 'cancelled', 'closed', 'inactive'].includes(s)) {
    return 'bg-gray-100 text-gray-600'
  }
  return 'bg-blue-100 text-blue-700'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(status)}`}>
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  )
}
