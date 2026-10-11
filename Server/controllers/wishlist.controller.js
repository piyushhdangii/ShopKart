import mongoose from 'mongoose'
import Customer from '../models/customer.model.js'
import Product from '../models/product.model.js'

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
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

        if (user.wishlist.includes(productId)) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist' })
        }

        user.wishlist.push(productId)
        await user.save()

        return res.status(200).json({ success: true, message: 'Product added to wishlist' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to add product to wishlist' })
    }
}

// GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: 'wishlist',
            select: 'name price category image stock'
        })

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to load wishlist' })
    }
}

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const user = await Customer.findById(req.user._id)

        const index = user.wishlist.indexOf(productId)
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product not in wishlist' })
        }

        user.wishlist.splice(index, 1)
        await user.save()

        return res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to remove product from wishlist' })
    }
}

// PATCH /wishlist/:productId/toggle (Bonus)
export const toggleWishlist = async (req, res) => {
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
        const index = user.wishlist.indexOf(productId)

        let added
        if (index === -1) {
            user.wishlist.push(productId)
            added = true
        } else {
            user.wishlist.splice(index, 1)
            added = false
        }

        await user.save()

        return res.status(200).json({
            success: true,
            added,
            message: added ? 'Product added to wishlist' : 'Product removed from wishlist'
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to update wishlist' })
    }
}
