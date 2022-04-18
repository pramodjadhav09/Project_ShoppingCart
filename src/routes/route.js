const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const auth = require("../middleware/auth")
const orderController = require("../controllers/orderController")






//user-
router.post('/register', userController.createUser)
router.post('/login', userController.UserLogin)
router.get('/user/:userId/profile', auth.authentication, auth.authorization, userController.getUser)
router.put('/user/:userId/profile', auth.authentication, auth.authorization, userController.updateUser)

//product-
router.post('/products', productController.CreateProduct)
router.get('/products', productController.getProducts)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProductById)
router.delete('/products/:productId', productController.deleteProduct)

//cart-
router.post('/users/:userId/cart', auth.authentication, auth.authorization, cartController.createCart)
router.get('/users/:userId/cart', auth.authentication, auth.authorization, cartController.getCart)
router.put('/users/:userId/cart', auth.authentication, auth.authorization, cartController.getCart)
router.delete('/users/:userId/cart', auth.authentication, auth.authorization, cartController.deleteProduct)

//order-
router.post('users/:userId/orders', auth.authentication, auth.authorization, orderController.createOrder)
router.put('users/:userId/orders', auth.authentication, auth.authorization, orderController.updateOrder)





module.exports = router