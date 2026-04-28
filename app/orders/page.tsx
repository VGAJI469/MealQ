'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { OrderRow, OrderRowSkeleton } from '@/components/order-row'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getOrders } from '@/lib/api'
import { type Order } from '@/lib/mock-data'

function OrdersContent() {
  const { student } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    async function loadOrders() {
      if (student) {
        try {
          const data = await getOrders()
          setOrders(data)
        } catch (error) {
          console.error('Failed to fetch orders:', error)
        }
      }
      setIsLoading(false)
    }
    loadOrders()
  }, [student])

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['Pending', 'Preparing', 'Confirmed', 'Ready'].includes(order.status)
    }
    if (filter === 'completed') {
      return ['Completed', 'Cancelled'].includes(order.status)
    }
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Your Orders
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track and manage your food orders
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {(['all', 'active', 'completed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  filter === filterOption
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="orders"
              title={filter !== 'all' ? `No ${filter} orders` : undefined}
              description={
                filter !== 'all'
                  ? `You don't have any ${filter} orders.`
                  : undefined
              }
            >
              <Link href="/canteens">
                <Button>Browse Canteens</Button>
              </Link>
            </EmptyState>
          )}
        </div>
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  )
}
