import { cn } from '@/lib/utils'

type Status = 'Pending' | 'Preparing' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled'
type Category = 'South Indian' | 'North Indian' | 'Fast Food' | 'Beverages' | 'Snacks'

interface StatusBadgeProps {
  status: Status
  className?: string
}

interface CategoryBadgeProps {
  category: Category
  className?: string
}

interface OpenBadgeProps {
  isOpen: boolean
  className?: string
}

const statusStyles: Record<Status, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Preparing: 'bg-orange-100 text-orange-700 border-orange-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Ready: 'bg-green-100 text-green-700 border-green-200',
  Completed: 'bg-gray-100 text-gray-700 border-gray-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const categoryStyles: Record<Category, string> = {
  'South Indian': 'bg-orange-100 text-orange-700 border-orange-200',
  'North Indian': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Fast Food': 'bg-red-100 text-red-700 border-red-200',
  'Beverages': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Snacks': 'bg-purple-100 text-purple-700 border-purple-200',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  )
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        categoryStyles[category],
        className
      )}
    >
      {category}
    </span>
  )
}

export function OpenBadge({ isOpen, className }: OpenBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isOpen
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-red-100 text-red-700 border-red-200',
        className
      )}
    >
      {isOpen ? 'Open' : 'Closed'}
    </span>
  )
}
