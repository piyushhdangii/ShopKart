import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getCart } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState(false)

  const fetchCart = useCallback(async () => {
    setCartLoading(true)
    setCartError(false)
    try {
      const response = await getCart()
      setCartItems(response.data.cart || [])
    } catch {
      setCartItems([])
      setCartError(true)
    } finally {
      setCartLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems],
  )

  const subtotal = useMemo(
    () => cartItems.reduce(
      (sum, item) => sum + (Number(item.product?.price || 0) * Number(item.quantity || 0)),
      0,
    ),
    [cartItems],
  )

  const refreshCart = useCallback(() => fetchCart(), [fetchCart])

  const addCartItem = useCallback((productId) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product?._id === productId)
      if (existing) {
        return prev.map((item) =>
          item.product?._id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { product: { _id: productId }, quantity: 1 }]
    })
  }, [])

  const updateCartItemQuantity = useCallback((productId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product?._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    )
  }, [])

  const removeCartItem = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.product?._id !== productId))
  }, [])

  const value = useMemo(
    () => ({
      cartItems,
      cartLoading,
      cartError,
      cartCount,
      subtotal,
      fetchCart,
      refreshCart,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      setCartItems,
    }),
    [cartItems, cartLoading, cartError, cartCount, subtotal, fetchCart, refreshCart, addCartItem, updateCartItemQuantity, removeCartItem],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

