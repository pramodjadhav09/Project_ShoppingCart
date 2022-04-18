//const jwt = require('jsonwebtoken')





// //AUTHENTICATION-
// const authentication = async function (req, res, next) {
//     try {
//         let token = req.headers["x-api-key"];
//         if (!token) return res.status(400).send({ status: false, msg: "login is required" })

//         let decodedtoken = jwt.verify(token, "secret key")

//         if (!decodedtoken) return res.status(400).send({ status: false, msg: "token is invalid" })
//         next();
//     }
//     catch (error) {
//         return res.status(500).send({ msg: error.message })
//     }
// }




// module.exports.authentication = authentication



const userModel = require("../models/userModel")
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken");

let isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}



const authentication = async function (req, res, next) {
    try {
        const bearerHeader = req.headers['x-api-key'];
        if (!bearerHeader) {
            return res.status(401).send({ status: false, message: "token is missing" })
        }
        if (typeof bearerHeader != 'undefined') {

            const bearer = bearerHeader.split(' ');
            const bearerToken = bearer[1];
            req.token = bearerToken;
            next()
        }
        else {
            res.sendStatus(403);
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}




const authorization = async function (req, res, next) {
    try {
        const bearerHeader = req.headers['x-api-key'];
        const userId = req.params.userId
        const decodedtoken = jwt.verify(req.token, "secret key")

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: " enter a valid userId" })
        }

        const userByUserId = await userModel.findById(userId)


        if (!userByUserId) {
            return res.status(404).send({ status: false, message: " user not found" })
        }

        if (userId !== decodedtoken.userId) {
            return res.status(403).send({ status: false, message: "unauthorized access" })
        }

        next()
    } catch (err) {
        res.status(500).send({ msg: err.message })
    }
}

module.exports.authentication = authentication
module.exports.authorization = authorization