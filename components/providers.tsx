'use client'

import { type ReactNode } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { RefreshAvailability } from '@/components/refresh-availability'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <RefreshAvailability />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
}
