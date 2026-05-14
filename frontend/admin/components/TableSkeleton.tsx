interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export default function TableSkeleton({ rows = 6, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="skeleton h-4 flex-1"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
