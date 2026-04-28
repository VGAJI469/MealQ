import { ShoppingCart, UtensilsCrossed, Receipt, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateType = 'cart' | 'orders' | 'menu' | 'canteens'

interface EmptyStateProps {
  type: EmptyStateType
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
}

const defaultContent: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
  cart: {
    icon: <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />,
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added any items yet. Browse our canteens to find delicious food!',
  },
  orders: {
    icon: <Receipt className="h-16 w-16 text-muted-foreground/50" />,
    title: 'No orders yet',
    description: 'You haven\'t placed any orders. Start by browsing our canteens and adding items to your cart.',
  },
  menu: {
    icon: <UtensilsCrossed className="h-16 w-16 text-muted-foreground/50" />,
    title: 'No menu items',
    description: 'This canteen doesn\'t have any menu items available right now. Please check back later.',
  },
  canteens: {
    icon: <Search className="h-16 w-16 text-muted-foreground/50" />,
    title: 'No canteens found',
    description: 'We couldn\'t find any canteens. Please try again later.',
  },
}

export function EmptyState({
  type,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  const content = defaultContent[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        {content.icon}
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground">
        {title || content.title}
      </h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {description || content.description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
