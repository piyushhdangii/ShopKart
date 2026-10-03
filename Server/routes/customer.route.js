import express from 'express'
import {getMe, loginCustomer, logoutCustomer, registerCustomer} from '../controllers/customer.controller.js'
import { isAuthenticated } from '../middlewares/auth.middleware.js'

const customerRoutes = express.Router()


customerRoutes.post('/register' , registerCustomer)
customerRoutes.post('/login' , loginCustomer)
customerRoutes.get('/me', isAuthenticated , getMe)
customerRoutes.get('/logout', logoutCustomer)
export default customerRoutes
