const userModel = require("../models/userModel")
const validator = require("../validator/validator")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { uploadFile } = require('../controllers/awsS3')



//CREATE USER---------------------------------

const createUser = async function (req, res) {
    try {
        let data = req.body;
        let files = req.files


        //Validations Starts------

        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide user details" })
        }

        if (!validator.isValidfiles(files)) {
            return res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
        }


        const { fname, lname, email, phone, password, address } = data


        //fname validation
        if (!validator.isValid(fname)) { return res.status(400).send({ status: false, message: "First name is required" }) }

        //lname validation
        if (!validator.isValid(lname)) { return res.status(400).send({ status: false, message: "Last name is required" }) }

        //email validation-
        if (!validator.isValid(email)) { return res.status(400).send({ status: false, message: "email is required" }) }

        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email" });

        const isEmailUsed = await userModel.findOne({ email: email })
        if (isEmailUsed) {
            res.status(400).send({ status: false, msg: "email must be unique" })
            return
        }


        //phone validation-
        if (!validator.isValid(phone)) { return res.status(400).send({ status: false, message: "Phone number is required" }) }
        if (!(/^([+]\d{2})?\d{10}$/.test(phone))) return res.status(400).send({ status: false, msg: "please provide a valid moblie Number" })

        const isPhoneUsed = await userModel.findOne({ phone: phone })
        if (isPhoneUsed) {
            res.status(400).send({ status: false, msg: "phone no should be unique" })
            return
        }

        //password validation-
        if (!validator.isValid(password)) { return res.status(400).send({ status: false, message: "password is required" }) }
        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password.trim()))) { return res.status(400).send({ status: false, msg: "please provide a valid password with one uppercase letter ,one lowercase, one character and one number " }) }

        //address validation-

        if (address) {
            if (address.shipping) {
                if (!validator.isValid(address.shipping.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                    return
                }
                if (!validator.isValid(address.shipping.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                    return
                }
                if (!validator.isValid(address.shipping.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                    return
                }
            }
            if (address.billing) {
                if (!validator.isValid(address.billing.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                    return
                }
                if (!validator.isValid(address.billing.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                    return
                }
                if (!validator.isValid(address.billing.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                    return
                }
            }
        }

        //Validations Ends------

        //encrypt paasword using bcrypt-
        let saltRounds = 10
        const encryptPassword = await bcrypt.hash(password, saltRounds)
        //console.log(encryptPassword)

        //upload profile image-
        const profilePicture = await uploadFile(files[0])

        //create user-

        const userData = {
            fname: fname,
            lname: lname,
            profileImage: profilePicture,
            email: email,
            phone: phone,
            password: encryptPassword,
            address: address
        }

        const userCreated = await userModel.create(userData);

        res.status(201).send({ status: true, message: `User created successfully`, data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.msg })
    }
}






//LOGIN USER-------------------------------


const UserLogin = async function (req, res) {
    try {
        let data = req.body

        //validations starts-
        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: " Please provide input to login" })
        }

        const { email, password } = data


        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "email is required" })

        }

        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }

        //validations ends-

        if (data.email && data.password) {

            let emailMatch = await userModel.findOne({ email: data.email });

            if (!emailMatch) {
                return res.status(400).send({ status: false, msg: "No user is registered with this email" })
            }

            const decryptPassword = await bcrypt.compare(data.password, emailMatch.password)
            console.log(decryptPassword)

            if (!decryptPassword) {
                return res.status(400).send({ status: false, msg: "Incorrect password" })
            }

            //sending jwt-
            const token = jwt.sign({
                userId: emailMatch._id
            }, "secret key", { expiresIn: "30m" })

            res.setHeader("x-api-key", token)

            return res.status(200).send({ status: true, msg: "User login successfull", userId: emailMatch._id, token })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.msg })
    }
}




//GET USER--------------


const getUser = async function (req, res) {
    
    let userId = req.params.userId

    try {

        if (typeof userId == undefined || userId == null) {
            return res.status(400).send({ status: false, msg: "Please insert a valid UserId" })
        }

        // if (!isValidObjectId(userId)) {
        //     return res.status(400).send({ status: false, message: "Not a Valid Object ID" })
        // }

        let isUserPresent = await userModel.findOne({ _id: userId })

        if (!isUserPresent) {
            return res.status(400).send({ status: false, msg: "User is not present" })
        }

        return res.status(200).send({ status: true, msg: "User profile details", data: isUserPresent })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}





//UPDATE USER----------------------------

const updateUser = async function (req, res) {

    try {
        let data = req.body;
        const userId = req.params.userId

        //Validations Starts-

        // if (!validator.isValidRequestBody(req.body) && !validator.isValid(req.files)) {
        //     return res.status(400).send({ status: false, message: "Please Enter something in request body" })
        // }

        const { fname, lname, email, phone, password, address } = data

        const updatedData = {}

        //fname validation
        if (fname) {
            if (!validator.isValid(fname)) {
                return res.status(400).send({ status: false, Message: "First name is required" })
            }
            updatedData.fname = fname
        }

        //lname validation-
        if (lname) {
            if (!validator.isValid(lname)) {
                return res.status(400).send({ status: false, Message: "Last name is required" })
            }
            updatedData.lname = lname
        }

        //email validation-
        if (email) {
            if (!validator.isValid(email)) { return res.status(400).send({ status: false, message: "email is required" }) }

            if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) return res.status(400).send({ status: false, msg: "Please provide a valid email" });

            const isEmailUsed = await userModel.findOne({ email: email })
            if (isEmailUsed) {
                return res.status(400).send({ status: false, msg: "email must be unique" })
            }
            updatedData.email = email
        }


        //profile pic upload and validation-

        let saltRounds = 10
        const files = req.files

        if (validator.isValidfiles(files)) {
            const profilePic = await uploadFile(files[0])

            updatedData.profileImage = profilePic

        }

        //phone validation-
        if (phone) {
            if (!validator.isValid(phone)) { return res.status(400).send({ status: false, message: "Phone number is required" }) }
            if (!(/^([+]\d{2})?\d{10}$/.test(phone))) return res.status(400).send({ status: false, msg: "please provide a valid phone number" })

            const isPhoneUsed = await userModel.findOne({ phone: phone })
            if (isPhoneUsed) {
                return res.status(400).send({ status: false, msg: "phone number must be unique" })
            }
            updatedData.phone = phone
        }

        //password validation-
        if (password) {
            if (!validator.isValid(password)) { return res.status(400).send({ status: false, message: "password is required" }) }
            if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password.trim()))) { return res.status(400).send({ status: false, msg: "please provide a valid password with one uppercase letter ,one lowercase, one character and one number " }) }

            const encryptPassword = await bcrypt.hash(password, saltRounds)

            updatedData.password = encryptPassword
        }


        //address validation-

        if (address) {

            if (address.shipping) {

                if (!validator.isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, Message: "street name is required" })
                }
                updatedData["address.shipping.street"] = address.shipping.street


                if (!validator.isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, Message: "city name is required" })
                }
                updatedData["address.shipping.city"] = address.shipping.city

                if (!validator.isValid(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, Message: "pincode is required" })
                }
                updatedData["address.shipping.pincode"] = address.shipping.pincode

            }

            if (address.billing) {
                if (!validator.isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                }
                updatedData["address.billing.street"] = address.billing.street

                if (!validator.isValid(address.billing.city)) {
                    return res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                }
                updatedData["address.billing.city"] = address.billing.city

                if (!validator.isValid(address.billing.pincode)) {
                    return res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                }
                updatedData["address.billing.pincode"] = address.billing.pincode
            }
        }

        //update data-

        const updatedUser = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })

        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser });
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports.createUser = createUser
module.exports.UserLogin = UserLogin
module.exports.getUser = getUser
module.exports.updateUser = updateUser