import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from '../../utils/axiosCustomize'

export type CartItem = {
  id: string
  quantity: number
  name?: string
  price?: number
  image?: string
  [key: string]: unknown
}

export type CartState = {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  totalItems: number
  totalPrice: number
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  totalItems: 0,
  totalPrice: 0,
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const maybeError = error as { response?: { data?: { message?: string } } }
    return maybeError.response?.data?.message || fallback
  }
  return fallback
}

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  )
  return { totalItems, totalPrice }
}

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/cart')
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch cart'))
    }
  }
)

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (item: CartItem, { rejectWithValue }) => {
    try {
      const response = await axios.post('/cart', item)
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to add item to cart'))
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/cart/${itemId}`)
      return itemId
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to remove item from cart'))
    }
  }
)

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/cart/${id}`, { quantity })
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update quantity'))
    }
  }
)

export const clearCartOnServer = createAsyncThunk(
  'cart/clearCartOnServer',
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete('/cart')
      return null
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to clear cart'))
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.totalItems = action.payload
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },
    addItem: (state, action: PayloadAction<CartItem>) => {
      const incoming = action.payload
      const existing = state.items.find((item) => item.id === incoming.id)
      if (existing) {
        existing.quantity += incoming.quantity
      } else {
        state.items.push(incoming)
      }
      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const { id, quantity } = action.payload
      const existing = state.items.find((item) => item.id === id)
      if (!existing) return
      existing.quantity = quantity
      const totals = calculateTotals(state.items)
      state.totalItems = totals.totalItems
      state.totalPrice = totals.totalPrice
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart cases
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add to cart cases
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        const item = action.payload
        const existing = state.items.find((i) => i.id === item.id)
        if (existing) {
          existing.quantity = item.quantity
        } else {
          state.items.push(item)
        }
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
        state.error = null
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Remove from cart cases
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
        state.error = null
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update quantity cases
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false
        const updated = action.payload
        const existing = state.items.find((item) => item.id === updated.id)
        if (existing) {
          existing.quantity = updated.quantity
        }
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
        state.error = null
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Clear cart on server cases
      .addCase(clearCartOnServer.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearCartOnServer.fulfilled, (state) => {
        state.isLoading = false
        state.items = []
        state.totalItems = 0
        state.totalPrice = 0
        state.error = null
      })
      .addCase(clearCartOnServer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCartCount, setCart, addItem, removeItem, clearCart, updateQuantity, clearError } =
  cartSlice.actions

export default cartSlice.reducer
