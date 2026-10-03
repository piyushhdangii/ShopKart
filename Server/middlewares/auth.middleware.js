import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js';

export const isAuthenticated = async (req,res,next)=>{
    try {
        const token = req.cookies.token

        const decoded = jwt.verify(token,process.env.jwt_secret)
        
        const customer = await Customer.findById(decoded.userId)

        req.user = customer

        next()

    } catch (error) {
        return res.status(401).json({message:"Token invalid or Expired"})
    }
}