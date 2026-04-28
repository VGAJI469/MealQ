'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { type MenuItem } from '@/lib/mock-data'
import { useCart } from '@/contexts/cart-context'
import { CategoryBadge } from '@/components/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface MenuItemCardProps {
  item: MenuItem
  canteenName: string
}

export function MenuItemCard({ item, canteenName }: MenuItemCardProps) {
  const { addItem, items, updateQuantity, removeItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const cartItem = items.find((i) => i.menuItem.id === item.id)
  const quantity = cartItem?.quantity || 0

  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Countdown timer logic
  useEffect(() => {
    if (!item.available_after) return
    
    const calculateTime = () => {
      const diff = new Date(item.available_after!).getTime() - new Date().getTime()
      if (diff <= 0) {
        setTimeLeft(null)
        return
      }
      setTimeLeft(Math.ceil(diff / 60000))
    }

    calculateTime()
    const timer = setInterval(calculateTime, 30000) // Update every 30s
    return () => clearInterval(timer)
  }, [item.available_after])

  const isActuallyAvailable = item.isAvailable && !item.available_after

  const handleAddToCart = () => {
    if (!isActuallyAvailable) return
    setIsAdding(true)
    addItem(item, canteenName)
    toast.success(`${item.name} added to cart`, {
      description: `₹${item.price}`,
    })
    setTimeout(() => setIsAdding(false), 200)
  }

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity === 1) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, quantity - 1)
    }
  }

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${!isActuallyAvailable ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={item.category} />
          {timeLeft !== null && (
            <div className="inline-flex items-center rounded-full bg-destructive/90 px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground shadow-sm animate-pulse">
              Back in {timeLeft} min
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-semibold text-foreground truncate">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
          <span className="shrink-0 font-heading text-lg font-bold text-primary">
            ₹{item.price}
          </span>
        </div>
        <div className="mt-4">
          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              disabled={!isActuallyAvailable}
              className={`w-full transition-transform ${isAdding ? 'scale-95' : ''} ${!isActuallyAvailable ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}`}
            >
              {timeLeft !== null ? (
                'Currently Refilling'
              ) : !item.isAvailable ? (
                'Out of Stock'
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrement}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-foreground">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrement}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MenuItemCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
