'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, CreditCard, Clock, X } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { StatusBadge, CategoryBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { fetchOrder, type Order } from '@/lib/mock-data'
import { toast } from 'sonner'

const categoryEmojis: Record<string, string> = {
  'South Indian': '🥘',
  'North Indian': '🍛',
  'Fast Food': '🍔',
  'Beverages': '☕',
  'Snacks': '🍿',
}

function OrderDetailContent() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      const data = await fetchOrder(orderId)
      setOrder(data || null)
      setIsLoading(false)
    }
    loadOrder()
  }, [orderId])

  const handleCancelOrder = async () => {
    setIsCancelling(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    if (order) {
      setOrder({ ...order, status: 'Cancelled' })
    }
    
    toast.success('Order cancelled successfully')
    setIsCancelling(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            type="orders"
            title="Order not found"
            description="The order you're looking for doesn't exist."
          >
            <Link href="/orders">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Button>
            </Link>
          </EmptyState>
        </main>
      </div>
    )
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Back Link */}
          <Link
            href="/orders"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>

          {/* Order Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {order.id}
                </h1>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formattedDate}</span>
              </div>
            </div>
            {order.status === 'Pending' && (
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="text-destructive hover:text-destructive"
              >
                {isCancelling ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Canteen Info */}
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{order.canteenName}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Pick up when ready</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-heading">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-accent/50">
                      <span className="text-2xl">
                        {categoryEmojis[item.menuItem.category]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {item.menuItem.name}
                          </h4>
                          <CategoryBadge
                            category={item.menuItem.category}
                            className="mt-1"
                          />
                        </div>
                        <p className="font-heading font-bold text-foreground">
                          ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Qty: {item.quantity} × ₹{item.menuItem.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment & Summary */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {order.paymentMethod}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === 'Cancelled' ? 'Refunded' : 'Paid'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      ₹{order.subtotal.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="text-foreground">
                      ₹{order.gst.toFixed(0)}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-heading text-lg font-bold text-primary">
                        ₹{order.total.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline */}
          {order.status !== 'Cancelled' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-heading text-base">
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {['Pending', 'Confirmed', 'Ready', 'Completed'].map(
                    (status, index) => {
                      const statusOrder = ['Pending', 'Confirmed', 'Ready', 'Completed']
                      const currentIndex = statusOrder.indexOf(order.status)
                      const isActive = index <= currentIndex
                      const isCurrent = status === order.status

                      return (
                        <div key={status} className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                              isActive
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                          >
                            {index + 1}
                          </div>
                          <span
                            className={`mt-2 text-xs font-medium ${
                              isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      )
                    }
                  )}
                </div>
                <div className="relative mt-2">
                  <div className="absolute left-5 right-5 top-0 h-0.5 bg-border" />
                  <div
                    className="absolute left-5 top-0 h-0.5 bg-primary transition-all"
                    style={{
                      width: `${
                        (['Pending', 'Confirmed', 'Ready', 'Completed'].indexOf(
                          order.status
                        ) /
                          3) *
                        100
                      }%`,
                      maxWidth: 'calc(100% - 40px)',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  )
}
