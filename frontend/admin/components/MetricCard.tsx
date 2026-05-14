interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'green' | 'amber' | 'red' | 'default'
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    value: 'text-green-700',
    dot: 'bg-green-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    value: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    value: 'text-red-700',
    dot: 'bg-red-500',
  },
  default: {
    bg: 'bg-white',
    border: 'border-gray-200',
    value: 'text-gray-900',
    dot: 'bg-gray-400',
  },
}

export default function MetricCard({ title, value, subtitle, color = 'default' }: MetricCardProps) {
  const colors = colorMap[color]

  return (
    <div className={`rounded-xl border p-5 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      </div>
      <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
