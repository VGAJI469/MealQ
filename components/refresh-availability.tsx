'use client'

import { useEffect } from 'react'

export function RefreshAvailability() {
  useEffect(() => {
    const refresh = async () => {
      try {
        await fetch('/api/menu/refresh-availability')
      } catch (err) {
        console.error('Failed to refresh availability:', err)
      }
    }

    // Refresh every 60 seconds
    const interval = setInterval(refresh, 60000)
    
    // Initial refresh
    refresh()

    return () => clearInterval(interval)
  }, [])

  return null // This component doesn't render anything
}
