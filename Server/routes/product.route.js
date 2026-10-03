import express from 'express'
import {
    createProduct,
    getProduct,
    getProducts
} from '../controllers/product.controller.js'

const productRoutes = express.Router()

productRoutes.post('/', createProduct)
productRoutes.get('/', getProducts)
productRoutes.get('/:id', getProduct)

export default productRoutes