import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8001/users',
    withCredentials: true, // sends the HttpOnly cookie automatically
})

export const registerCustomer = (data) => api.post('/register', data)
export const loginCustomer = (data) => api.post('/login', data)
export const getMe = () => api.get('/me')
export const logoutCustomer = () => api.get('/logout')

const productApi = axios.create({
    baseURL: 'http://localhost:8001/products',
    withCredentials: true,
})

export const getProducts = (params) => productApi.get('/', { params })
export const getProduct = (id) => productApi.get(`/${id}`)

const wishlistApi = axios.create({
    baseURL: 'http://localhost:8001/wishlist',
    withCredentials: true,
})

export const getWishlist = () => wishlistApi.get('/')
export const addToWishlist = (productId) => wishlistApi.post(`/${productId}`)
export const removeFromWishlist = (productId) => wishlistApi.delete(`/${productId}`)
export const toggleWishlistItem = (productId) => wishlistApi.patch(`/${productId}/toggle`)

const cartApi = axios.create({
    baseURL: 'http://localhost:8001/cart',
    withCredentials: true,
})

export const getCart = () => cartApi.get('/')
export const addToCart = (productId) => cartApi.post(`/${productId}`)
export const updateCartQuantity = (productId, quantity) => cartApi.patch(`/${productId}`, { quantity })
export const removeCartItem = (productId) => cartApi.delete(`/${productId}`)

export default api
