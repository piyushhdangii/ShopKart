import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

const normalizeCartPayload = (cartEntries) =>
  cartEntries.map((entry) => ({
    _id: entry._id,
    product: entry.product,
    quantity: entry.quantity,
  }))

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const user = await Customer.findById(req.user._id)
    const existingItem = user.cart.find((item) => item.product.toString() === productId)

    if (existingItem) {
      const nextQuantity = existingItem.quantity + 1
      if (nextQuantity > product.stock) {
        return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' })
      }

      existingItem.quantity = nextQuantity
    } else {
      user.cart.push({ product: productId, quantity: 1 })
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: user.cart,
    })
  } catch (error) {
    console.error('Add to cart error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to add product to cart' })
  }
}

export const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price category image stock',
    })

    return res.status(200).json({
      success: true,
      cart: normalizeCartPayload(user.cart),
    })
  } catch (error) {
    console.error('Get cart error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to load cart' })
  }
}

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const user = await Customer.findById(req.user._id)
    const item = user.cart.find((entry) => entry.product.toString() === productId)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not in cart' })
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Quantity exceeds available stock' })
    }

    item.quantity = quantity
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: user.cart,
    })
  } catch (error) {
    console.error('Update cart quantity error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to update cart quantity' })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' })
    }

    const user = await Customer.findById(req.user._id)
    const itemIndex = user.cart.findIndex((entry) => entry.product.toString() === productId)

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' })
    }

    user.cart.splice(itemIndex, 1)
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: user.cart,
    })
  } catch (error) {
    console.error('Remove from cart error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to remove product from cart' })
  }
}
