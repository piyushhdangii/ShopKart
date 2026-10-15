import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Order from '../models/order.model.js'
import Product from '../models/product.model.js'
import { createRazorpayOrder, verifyRazorpaySignature } from '../config/razorpay.js'

const normalizeShippingAddress = (shippingAddress = {}) => ({
  fullName: String(shippingAddress.fullName || '').trim(),
  phone: String(shippingAddress.phone || '').trim(),
  addressLine1: String(shippingAddress.addressLine1 || '').trim(),
  city: String(shippingAddress.city || '').trim(),
  state: String(shippingAddress.state || '').trim(),
  pincode: String(shippingAddress.pincode || '').trim(),
})

const validateShippingAddress = (shippingAddress = {}) => {
  const cleanAddress = normalizeShippingAddress(shippingAddress)
  const errors = []

  if (!cleanAddress.fullName) {
    errors.push('Full name is required.')
  }

  if (!cleanAddress.phone) {
    errors.push('Phone number is required.')
  } else if (!/^[0-9+\-\s()]{8,15}$/.test(cleanAddress.phone)) {
    errors.push('Phone number is invalid.')
  }

  if (!cleanAddress.addressLine1) {
    errors.push('Address is required.')
  }

  if (!cleanAddress.city) {
    errors.push('City is required.')
  }

  if (!cleanAddress.state) {
    errors.push('State is required.')
  }

  if (!cleanAddress.pincode) {
    errors.push('Pincode is required.')
  } else if (!/^\d{6}$/.test(cleanAddress.pincode)) {
    errors.push('Pincode must contain 6 digits.')
  }

  return {
    valid: errors.length === 0,
    errors,
    address: cleanAddress,
  }
}

const buildOrderItems = async (cartEntries) => {
  const productIds = cartEntries
    .map((entry) => entry.product?._id ?? entry.product)
    .filter(Boolean)
  const products = await Product.find({ _id: { $in: productIds } })
  const productMap = new Map(products.map((product) => [product._id.toString(), product]))

  let totalAmount = 0
  const items = []

  for (const entry of cartEntries) {
    const productId = entry.product?._id ?? entry.product
    const product = productId ? productMap.get(String(productId)) : null

    if (!product) {
      throw new Error(`${productId || 'A product in your cart'} is unavailable right now.`)
    }

    if (entry.quantity > product.stock) {
      throw new Error(`Insufficient stock for ${product.name}.`)
    }

    totalAmount += product.price * entry.quantity
    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: entry.quantity,
      image: product.image,
    })
  }

  return { items, totalAmount }
}

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' })
    }

    const validationResult = validateShippingAddress(shippingAddress)

    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.errors[0],
      })
    }

    const user = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price stock image',
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer not found.' })
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' })
    }

    const { items, totalAmount } = await buildOrderItems(user.cart)

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: validationResult.address,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    })

    const razorpayOrder = await createRazorpayOrder({
      amount: totalAmount,
      receipt: String(order._id),
    })

    order.razorpayOrderId = razorpayOrder.id
    await order.save()

    return res.status(201).json({
      success: true,
      message: 'Payment order created successfully.',
      order,
      razorpay: {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.id,
      },
    })
  } catch (error) {
    console.error('Create payment order error:', error.message)

    if (error.message.includes('Insufficient stock') || error.message.includes('unavailable right now')) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(500).json({ success: false, message: 'Unable to create payment order.' })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, mockMode } = req.body

    const lookupOrderId = orderId || razorpay_order_id
    if (!lookupOrderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required for verification.' })
    }

    const order = await Order.findById(lookupOrderId).populate('user')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not allowed to access this order.' })
    }

    const isMockMode = mockMode === true || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET
    const isSignatureValid = isMockMode
      ? true
      : verifyRazorpaySignature({
          orderId: razorpay_order_id || order.razorpayOrderId,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        })

    if (!isSignatureValid) {
      order.paymentStatus = 'FAILED'
      order.status = 'PENDING_PAYMENT'
      await order.save()
      return res.status(400).json({ success: false, message: 'Payment signature verification failed.' })
    }

    order.paymentStatus = 'PAID'
    order.status = 'PLACED'
    order.razorpayPaymentId = razorpay_payment_id || order.razorpayPaymentId
    order.razorpaySignature = razorpay_signature || 'mock_signature'
    await order.save()

    const customer = await Customer.findById(req.user._id)
    customer.cart = []
    await customer.save()

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully.',
      order,
    })
  } catch (error) {
    console.error('Verify payment error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to verify payment.' })
  }
}

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })

    return res.status(200).json({ success: true, orders })
  } catch (error) {
    console.error('Get orders error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to fetch orders.' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    const order = await Order.findOne({ _id: id, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    return res.status(200).json({ success: true, order })
  } catch (error) {
    console.error('Get order by id error:', error.message)
    return res.status(500).json({ success: false, message: 'Unable to fetch order details.' })
  }
}
