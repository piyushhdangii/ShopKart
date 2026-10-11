import express from 'express'
import { addToCart, getCart, removeFromCart, updateCartQuantity } from '../controllers/cart.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const cartRoutes = express.Router()

cartRoutes.use(isAuthenticated)
cartRoutes.post('/:productId', addToCart)
cartRoutes.get('/', getCart)
cartRoutes.patch('/:productId', updateCartQuantity)
cartRoutes.delete('/:productId', removeFromCart)

export default cartRoutes
