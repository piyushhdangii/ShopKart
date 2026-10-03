import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import customerRoutes from './routes/customer.route.js'
import productRoutes from './routes/product.route.js'
const app = express()
const Port = 8001
dotenv.config()

dns.setServers([
  '8.8.8.8', // Google DNS
  '8.8.4.4'
]);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use('/users', customerRoutes)
app.use('/products', productRoutes)

mongoose.connect(process.env.MongoDB_URI).then(() => {
    console.log("Db Connected")
}).catch((err) => {
    console.log(err)
})


app.get("/",(req,res)=>{
    res.send("Hello")
})

app.listen(Port , ()=>{
    console.log(`Server Started at ${Port}`)
})