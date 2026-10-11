import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import customerRoutes from './routes/customer.route.js'
import productRoutes from './routes/product.route.js'
import wishlistRoutes from './routes/wishlist.route.js'
import cartRoutes from './routes/cart.route.js'
const app = express()
const Port = 8001
dotenv.config()

dns.setServers(['8.8.8.8', '8.8.4.4'])

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/users', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)

app.get("/",(req,res)=>{
    res.send("Hello")
})

const startServer = async () => {
    try {
        if (!process.env.MongoDB_URI) {
            throw new Error('MongoDB_URI is not configured')
        }

        await mongoose.connect(process.env.MongoDB_URI)
        console.log('Db Connected')

        app.listen(Port, () => {
            console.log(`Server Started at ${Port}`)
        })
    } catch (error) {
        console.error(`Unable to start server: ${error.message}`)
        process.exitCode = 1
    }
}

startServer()