'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type MenuItem } from '@/lib/mock-data'

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  canteenId: string | null
  canteenName: string | null
  totalItems: number
  subtotal: number
  gst: number
  total: number
  addItem: (menuItem: MenuItem, canteenName: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  cartBounce: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const GST_RATE = 0.05

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [canteenName, setCanteenName] = useState<string | null>(null)
  const [cartBounce, setCartBounce] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('mealq_cart')
    if (storedCart) {
      const parsed = JSON.parse(storedCart)
      setItems(parsed.items || [])
      setCanteenId(parsed.canteenId || null)
      setCanteenName(parsed.canteenName || null)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'mealq_cart',
      JSON.stringify({ items, canteenId, canteenName })
    )
  }, [items, canteenId, canteenName])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )
  const gst = subtotal * GST_RATE
  const total = subtotal + gst

  const triggerBounce = () => {
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 300)
  }

  const addItem = (menuItem: MenuItem, newCanteenName: string) => {
    // If adding from a different canteen, clear cart first
    if (canteenId && canteenId !== menuItem.canteenId) {
      setItems([{ menuItem, quantity: 1 }])
      setCanteenId(menuItem.canteenId)
      setCanteenName(newCanteenName)
    } else {
      setItems((prev) => {
        const existingItem = prev.find(
          (item) => item.menuItem.id === menuItem.id
        )
        if (existingItem) {
          return prev.map((item) =>
            item.menuItem.id === menuItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
        return [...prev, { menuItem, quantity: 1 }]
      })
      if (!canteenId) {
        setCanteenId(menuItem.canteenId)
        setCanteenName(newCanteenName)
      }
    }
    triggerBounce()
  }

  const removeItem = (menuItemId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((item) => item.menuItem.id !== menuItemId)
      if (newItems.length === 0) {
        setCanteenId(null)
        setCanteenName(null)
      }
      return newItems
    })
  }

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setCanteenId(null)
    setCanteenName(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        canteenId,
        canteenName,
        totalItems,
        subtotal,
        gst,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartBounce,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
