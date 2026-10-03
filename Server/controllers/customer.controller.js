import Customer from "../models/customer.model.js";
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js";


const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
}

export const registerCustomer = async (req,res)=>{
    try{
        const {fullName, email, password, phone} = req.body

        if(!fullName || !email || !password || !phone) {
            return res.status(400).json({message: 'All fields required'})
        }
        if(password.length < 6 ){
            return res.status(400).json({message:"Password must contain atleast 6 characters"})
        }

        const emailExists = await Customer.findOne({email})

        if(emailExists){
            return res.status(409).json({message: "Email already exists. Please use a different email."})
        }

        const phoneExists = await Customer.findOne({phone})

        if(phoneExists){
            return res.status(409).json({message: "Phone number already registered. Please use a different number."})
        }

        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(password , salt)

        const newCustomer = await Customer.create({
            fullName,
            email,
            password : hashedPassword,
            phone
        })

        return res.status(201).json({
            message: 'Account created successfully',
            customer: {
                id: newCustomer._id,
                fullName: newCustomer.fullName,
                email: newCustomer.email,
                phone: newCustomer.phone
            }
        })
    }
    catch(error) {
        console.error('Register error:', error.message)
        res.status(500).json({message: 'Server crashed', error: error.message})
    }
}




export const loginCustomer = async (req,res)=>{
    try {
        const {email , password} = req.body

        if(!email || !password){
            return res.status(400).json({ message: 'All fields Required' })
        }

        const user = await Customer.findOne({email})

        if(!user){
           return res.status(400).json({message:"User not found"})
        }

        const passwordMatched = await bcrypt.compare(password, user.password)

        if(passwordMatched){
            const token = genToken(user._id)
            res.cookie('token',token, cookieOptions)

            return res.status(200).json({message:"User Logged in" , userData:user})
        }
        else{
            return res.status(401).json({message:"Wrong Password"})
        }


    } catch (error) {
        return res.status(500).json({message:"Server Crashed"})
    }
}

export const logoutCustomer = (req, res) => {
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out" })
}

export const getMe = (req,res)=>{
    const authenticatedUser = req.user
    res.status(200).json({authenticatedUser})
}