import crypto from 'crypto'
import Razorpay from 'razorpay'

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return null
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt = 'shopkart-order' }) => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
  const client = getRazorpayClient()

  if (!client) {
    return {
      id: `mock_order_${Date.now()}`,
      amount: Number(amount) * 100,
      currency,
      receipt,
      key: keyId,
      status: 'created',
    }
  }

  const order = await client.orders.create({
    amount: Number(amount) * 100,
    currency,
    receipt,
  })

  return {
    ...order,
    key: keyId,
  }
}

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret'

  if (!orderId || !paymentId || !signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return expectedSignature === signature
}
