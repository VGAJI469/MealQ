'use client'

import { Plus, Minus, Trash2 } from 'lucide-react'
import { type CartItem as CartItemType } from '@/contexts/cart-context'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/status-badge'

interface CartItemProps {
  item: CartItemType
}

const categoryEmojis: Record<string, string> = {
  'South Indian': '🥘',
  'North Indian': '🍛',
  'Fast Food': '🍔',
  'Beverages': '☕',
  'Snacks': '🍿',
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { menuItem, quantity } = item
  const subtotal = menuItem.price * quantity

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-accent/50">
        <span className="text-3xl">{categoryEmojis[menuItem.category]}</span>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-heading font-semibold text-foreground">
              {menuItem.name}
            </h4>
            <CategoryBadge category={menuItem.category} className="mt-1" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(menuItem.id)}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(menuItem.id, quantity - 1)}
              className="h-7 w-7"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateQuantity(menuItem.id, quantity + 1)}
              className="h-7 w-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              ₹{menuItem.price} each
            </p>
            <p className="font-heading font-bold text-primary">
              ₹{subtotal}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
