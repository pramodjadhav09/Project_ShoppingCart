const express = require('express')
const router = express.Router()
const userController= require("../controllers/userController")
const awsS3= require('../controllers/awsS3')






router.post("/uploadfile",awsS3.uploadFile)
router.post('/register',userController.createUser)
router.post('/login',userController.UserLogin)
router.get('/user/:userId/profile',userController.getUser)
router.put('/user/:userId/profile',userController.updateUser)


module.exports= router