'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, IndianRupee, Store, ArrowRight, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrders, getCanteens } from '@/lib/api'
import { type Order, type Canteen } from '@/lib/mock-data'
import { enrichCanteen } from '@/lib/canteen-details'

function DashboardContent() {
  const { student } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (student) {
        try {
          const [ordersData, canteensData] = await Promise.all([
            getOrders(),
            getCanteens(),
          ])
          setOrders(ordersData)
          setCanteens(canteensData.map((c: any) => ({
            ...c,
            id: c.canteen_id.toString(),
            isOpen: c.is_open,
          })).map(enrichCanteen))
        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [student])

  const activeOrders = orders.filter(
    (o) =>
      o.status === 'Pending' ||
      o.status === 'Preparing' ||
      o.status === 'Confirmed' ||
      o.status === 'Ready'
  ).length
  const totalSpent = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0)
  const openCanteens = canteens.filter((c) => c.isOpen).length

  const recentOrders = orders.slice(0, 3)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {getGreeting()}, {student?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Ready to order some delicious food today?
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Orders
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {activeOrders}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </CardTitle>
                <div className="rounded-lg bg-green-100 p-2">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    ₹{totalSpent.toFixed(0)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="transition-all duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Canteens Open
                </CardTitle>
                <div className="rounded-lg bg-amber-100 p-2">
                  <Store className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {openCanteens}{' '}
                    <span className="text-lg font-normal text-muted-foreground">
                      / {canteens.length}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Recent Orders
              </h2>
              <Link href="/orders">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-muted"
                  />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <Card className="cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {order.id}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground truncate">
                            {order.canteenName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-heading font-bold text-foreground">
                            ₹{order.total.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 font-medium text-muted-foreground">
                    No orders yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start by browsing our canteens
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CTA */}
          <Card className="overflow-hidden bg-gradient-to-br from-primary to-orange-600">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
              <div className="flex-1">
                <h3 className="font-heading text-2xl font-bold text-primary-foreground">
                  Hungry? Browse our canteens
                </h3>
                <p className="mt-2 text-primary-foreground/80">
                  Discover delicious meals from campus canteens and skip the queue!
                </p>
              </div>
              <Link href="/canteens">
                <Button
                  size="lg"
                  variant="secondary"
                  className="shrink-0 bg-white text-primary hover:bg-white/90"
                >
                  Browse Menus
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
