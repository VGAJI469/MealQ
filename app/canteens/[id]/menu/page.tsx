'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, ShoppingCart } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { MenuItemCard, MenuItemCardSkeleton } from '@/components/menu-item-card'
import { OpenBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { getCanteen, getCanteenMenu } from '@/lib/api'
import { type Canteen, type MenuItem } from '@/lib/mock-data'
import { enrichCanteen } from '@/lib/canteen-details'

type Category = 'All' | 'South Indian' | 'North Indian' | 'Fast Food' | 'Beverages' | 'Snacks'
type CanteenWithDescription = Canteen & { description?: string }

const categories: Category[] = ['All', 'South Indian', 'North Indian', 'Fast Food', 'Beverages', 'Snacks']

function MenuContent() {
  const params = useParams()
  const canteenId = params.id as string
  const { totalItems, total } = useCart()

  const [canteen, setCanteen] = useState<CanteenWithDescription | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')

  useEffect(() => {
    async function loadData() {
      try {
        const idInt = parseInt(canteenId)
        const [canteenData, menuData] = await Promise.all([
          getCanteen(idInt),
          getCanteenMenu(idInt),
        ])
        
        setCanteen(enrichCanteen({
          ...canteenData,
          id: canteenData.canteen_id.toString(),
          isOpen: canteenData.is_open,
          openTime: canteenData.open_time,
          closeTime: canteenData.close_time,
          image: canteenData.image || `/canteen-${(canteenData.canteen_id % 6) + 1}.jpg`
        }))
        
        setMenuItems(menuData.map((m: any) => ({
          ...m,
          id: m.item_id.toString(),
          canteenId: m.canteen_id.toString(),
          isAvailable: m.is_available,
        })))
      } catch (error) {
        console.error('Failed to load menu data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [canteenId])

  const filteredItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-10 w-64 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-5 w-48 animate-pulse rounded bg-muted" />
          </div>
          {/* Menu Grid Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <MenuItemCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!canteen) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            type="canteens"
            title="Canteen not found"
            description="The canteen you're looking for doesn't exist."
          >
            <Link href="/canteens">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Canteens
              </Button>
            </Link>
          </EmptyState>
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
            Back to Canteens
          </Link>

          {/* Canteen Header */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                    {canteen.name}
                  </h1>
                  <OpenBadge isOpen={canteen.isOpen} />
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{canteen.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {canteen.openTime} - {canteen.closeTime}
                    </span>
                  </div>
                </div>
                {canteen.description && (
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                    {canteen.description}
                  </p>
                )}
              </div>
              <span className="text-6xl">🍽️</span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  canteenName={canteen.name}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="menu"
              title={`No ${selectedCategory.toLowerCase()} items`}
              description={
                selectedCategory === 'All'
                  ? undefined
                  : `No ${selectedCategory.toLowerCase()} items available. Try another category.`
              }
            />
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:right-6 sm:bottom-6">
          <Link href="/cart">
            <Button
              size="lg"
              className="w-full shadow-lg sm:w-auto"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              View Cart ({totalItems}) - ₹{total.toFixed(0)}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default function MenuPage() {
  return (
    <ProtectedRoute>
      <MenuContent />
    </ProtectedRoute>
  )
}
