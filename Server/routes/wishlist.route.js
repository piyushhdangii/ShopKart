import express from 'express'
import { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } from '../controllers/wishlist.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const wishlistRoutes = express.Router()

wishlistRoutes.get('/', isAuthenticated, getWishlist)
wishlistRoutes.post('/:productId', isAuthenticated, addToWishlist)
wishlistRoutes.delete('/:productId', isAuthenticated, removeFromWishlist)
wishlistRoutes.patch('/:productId/toggle', isAuthenticated, toggleWishlist)

export default wishlistRoutes
