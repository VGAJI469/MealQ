'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { type Order } from '@/lib/mock-data'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderRowProps {
  order: Order
}

export function OrderRow({ order }: OrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div
        className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading font-semibold text-foreground">
              {order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground truncate">
            {order.canteenName}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <p className="font-heading font-bold text-foreground">
            ₹{order.total.toFixed(0)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/orders/${order.id}`} onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile price/date */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2 sm:hidden">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <p className="font-heading font-bold text-foreground">
          ₹{order.total.toFixed(0)}
        </p>
      </div>

      {/* Expanded Items */}
      <div
        className={cn(
          'grid transition-all duration-300',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
              Order Items
            </h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span className="text-muted-foreground">
                    ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (5%)</span>
                <span>₹{order.gst.toFixed(0)}</span>
              </div>
              <div className="mt-1 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderRowSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="hidden sm:block">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-5 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
