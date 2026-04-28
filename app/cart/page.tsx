'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Banknote, Smartphone, Trash2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { CartItem } from '@/components/cart-item'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type PaymentMethod = 'Cash' | 'UPI' | 'Card'

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'Cash', label: 'Cash', icon: <Banknote className="h-5 w-5" /> },
  { value: 'UPI', label: 'UPI', icon: <Smartphone className="h-5 w-5" /> },
  { value: 'Card', label: 'Card', icon: <CreditCard className="h-5 w-5" /> },
]

import { createOrder, createPayment } from '@/lib/api'

function CartContent() {
  const router = useRouter()
  const { items, canteenId, canteenName, subtotal, gst, total, clearCart } = useCart()
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('UPI')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const handlePlaceOrder = async () => {
    if (!canteenId) return

    setIsPlacingOrder(true)
    try {
      // 1. Create the order
      const orderData = {
        canteen_id: parseInt(canteenId),
        items: items.map((item) => ({
          item_id: parseInt(item.menuItem.id),
          quantity: item.quantity,
        })),
        payment_method: selectedPayment,
      }

      const order = await createOrder(orderData)

      // 2. Temporarily complete payment for all orders (including Cash)
      await createPayment({
        order_id: order.order_id,
        method: selectedPayment,
        amount: order.total_amount,
      })

      toast.success('Order placed successfully!', {
        description: `Your order will be ready soon at ${canteenName}`,
      })

      clearCart()
      router.push('/orders')
    } catch (error: any) {
      console.error('Order failed:', error)
      toast.error('Failed to place order', {
        description: error.message || 'Please try again later',
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="mb-8 font-heading text-3xl font-bold text-foreground">
              Your Cart
            </h1>
            <EmptyState type="cart">
              <Link href="/canteens">
                <Button>Browse Canteens</Button>
              </Link>
            </EmptyState>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Back Link */}
          <Link
            href="/canteens"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Your Cart
              </h1>
              <p className="mt-1 text-muted-foreground">
                Ordering from {canteenName}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.menuItem.id} item={item} />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="font-heading">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST (5%)</span>
                      <span className="text-foreground">₹{gst.toFixed(0)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-heading text-xl font-bold text-primary">
                          ₹{total.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-foreground">
                      Payment Method
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setSelectedPayment(method.value)}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all',
                            selectedPayment === method.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/50'
                          )}
                        >
                          <div
                            className={cn(
                              'text-muted-foreground',
                              selectedPayment === method.value && 'text-primary'
                            )}
                          >
                            {method.icon}
                          </div>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              selectedPayment === method.value
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                          >
                            {method.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="h-12 w-full text-base"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Spinner className="mr-2 h-5 w-5" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order - ₹${total.toFixed(0)}`
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By placing this order, you agree to our terms of service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  )
}
