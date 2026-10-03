import mongoose from 'mongoose'
import Product from '../models/product.model.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const createProduct = async (req, res) => {
	try {
		const product = await Product.create(req.body)
		return res.status(201).json({ success: true, product })
	} catch (error) {
		if (error.name === 'ValidationError' || error.name === 'CastError') {
			return res.status(400).json({ success: false, message: error.message })
		}
		return res.status(500).json({ success: false, message: 'Unable to create product' })
	}
}

export const getProducts = async (req, res) => {
	try {
		const { search, category } = req.query
		const query = {}

		if (typeof search === 'string' && search.trim()) {
			query.name = { $regex: escapeRegex(search.trim()), $options: 'i' }
		}
		if (typeof category === 'string' && category.trim()) {
			query.category = category.trim()
		}

		const products = await Product.find(query)
			.select('name price category image stock')
			.sort({ createdAt: -1 })

		return res.status(200).json({ success: true, count: products.length, products })
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Unable to load products' })
	}
}

export const getProduct = async (req, res) => {
	const { id } = req.params
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({ success: false, message: 'Invalid product ID' })
	}

	try {
		const product = await Product.findById(id)
		if (!product) {
			return res.status(404).json({ success: false, message: 'Product not found' })
		}
		return res.status(200).json({ success: true, product })
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Unable to load product' })
	}
}
