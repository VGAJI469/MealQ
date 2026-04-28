'use client'

import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { type Canteen } from '@/lib/mock-data'
import { OpenBadge } from '@/components/status-badge'
import { Card, CardContent } from '@/components/ui/card'

interface CanteenCardProps {
  canteen: Canteen
}

export function CanteenCard({ canteen }: CanteenCardProps) {
  return (
    <Link href={`/canteens/${canteen.id}/menu`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-accent">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
          <div className="absolute right-3 top-3">
            <OpenBadge isOpen={canteen.isOpen} />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {canteen.name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{canteen.location}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {canteen.openTime} - {canteen.closeTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function CanteenCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 animate-pulse bg-muted" />
      <CardContent className="p-4">
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
