const express = require('express')
const router = express.Router()
const userController= require("../controllers/userController")
const awsS3= require('../controllers/awsS3')

router.post("/uploadfile",awsS3.uploadFiles,)
router.post('/register',userController.createUser)


module.exports= router