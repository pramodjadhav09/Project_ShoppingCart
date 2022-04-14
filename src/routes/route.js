const express = require('express')
const router = express.Router()
const userController = require("../controllers/userController")
const awsS3 = require('../controllers/awsS3')
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")



//user-
//router.post('/uploadfile', awsS3.uploadFile)
router.post('/register', userController.createUser)
router.post('/login', userController.UserLogin)
router.get('/user/:userId/profile', userController.getUser)
router.put('/user/:userId/profile', userController.updateUser)

//product-
router.post('/products', productController.CreateProduct)
router.get('/products', productController.getProducts)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProductById)
router.delete('/products/:productId', productController.deleteProduct)

//cart-

router.post('/users/:userId/cart',cartController.createCart)
router.get('/users/:userId/cart',cartController.getCart)
router.delete('/users/:userId/cart',cartController.deleteProduct)




module.exports = router