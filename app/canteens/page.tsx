'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { Navbar } from '@/components/navbar'
import { CanteenCard, CanteenCardSkeleton } from '@/components/canteen-card'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import { getCanteens } from '@/lib/api'
import { type Canteen } from '@/lib/mock-data'
import { enrichCanteen } from '@/lib/canteen-details'

function CanteensContent() {
  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadCanteens() {
      try {
        const data = await getCanteens()
        // Map backend field names if they differ, or just use as is if they match
        // In this case, Canteen interface expects 'id' but backend might return 'canteen_id'
        const mappedData = data.map((c: any) => ({
          ...c,
          id: c.canteen_id.toString(), // Keep as string for frontend compatibility
          isOpen: c.is_open,
          openTime: c.open_time,
          closeTime: c.close_time,
          image: c.image || `/canteen-${(c.canteen_id % 6) + 1}.jpg` // Fallback image
        })).map(enrichCanteen)
        setCanteens(mappedData)
      } catch (error) {
        console.error('Failed to load canteens:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCanteens()
  }, [])

  const filteredCanteens = canteens.filter(
    (canteen) =>
      canteen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      canteen.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Campus Canteens
            </h1>
            <p className="mt-1 text-muted-foreground">
              Choose a canteen to explore their menu
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search canteens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10"
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CanteenCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCanteens.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCanteens.map((canteen) => (
                <CanteenCard key={canteen.id} canteen={canteen} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="canteens"
              title={searchQuery ? 'No results found' : undefined}
              description={
                searchQuery
                  ? `No canteens match "${searchQuery}". Try a different search.`
                  : undefined
              }
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function CanteensPage() {
  return (
    <ProtectedRoute>
      <CanteensContent />
    </ProtectedRoute>
  )
}
