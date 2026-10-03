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

export default api
