const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const validator = require('../validator/validator')




//CreateCart--------------------

const createCart = async function (req, res) {
    try {
        const userIdFromParams = req.params.userId;

        if (!validator.isValid(userIdFromParams)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter the userId" });
        }
        if (!validator.isValidObjectId(userIdFromParams)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a valid userId" });
        }

        const user = await userModel.findOne({ _id: userIdFromParams });

        if (!user) {
            return res.status(404).send({ status: false, msg: "user not found" });
        }

        const cartAlreadyPresent = await cartModel.findOne({userId: userIdFromParams});

        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "enter a body" });
        }

        const { userId, items } = requestBody;

        if (!validator.isValid(userId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter the userId" });
        }

        if (!validator.isValidObjectId(userId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a valid userId" });
        }

        if (userIdFromParams !== userId) {
            return res.status(400).send({
                status: false, msg: "user in params doesn't match with user in body"
            });
        }

        if (!validator.isValid(items.productId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter the productId" });
        }

        if (!validator.isValidObjectId(items.productId)) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a valid productId" });
        }

        if (!validator.isValid(items.quantity) && items.quantity < 1) {
            return res
                .status(400)
                .send({ status: false, msg: "enter a quantity more than 1 " });
        }

        const product = await productModel.findOne({ _id: items.productId });

        if (!product) {
            return res.status(404).send({ status: false, msg: "product not found" });
        }

        let totalItems = items.length;
        let totalPrice = product.price * totalItems;

        if (cartAlreadyPresent) {
            const cartItems = cartAlreadyPresent.items;
            cartItems.forEach((item) => (totalItems += item.quantity));
            totalItems += 1;
            totalPrice += cartAlreadyPresent.totalPrice;

            // if product is already added then only quantity will increase
            const cart = await cartModel.findOneAndUpdate(
                { userId: userIdFromParams },
                {
                    $push: { items: items },
                    $set: { totalPrice: totalPrice, totalItems: totalItems },
                },
                { new: true }
            );
            return res.status(201).send({ status: true, data: cart });
        }

        newCart = {
            userId,
            items,
            totalPrice,
            totalItems,
        };

        createCart = await cartModel.create(newCart);

        res.status(201).send({ status: true, data: createCart });

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}






//GetCart-----------------------

const getCart = async function (req, res) {

    try {
        let userId = req.params.userId
        let data = await cartModel.findOne({ userId: userId })

        //check if cart exist-
        if (!data) {
            return res.status(400).send({ status: false, message: "No such cart exist" })
        }

        //check if user exist-
        let isUserExist = await userModel.findById(userId)

        if (!isUserExist) {
            return res.status(400).send({ status: false, message: "User doesn't exist" })
        }

        return res.status(200).send({ status: true, message: true, data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}






//DeleteProductInCart--------------------------


const deleteProduct = async function (req, res) {

    try {
        let userId = req.params.userId;
        let data = await cartModel.findOne({ userId: userId })

        //check if cart exist-
        if (!data) {
            return res.status(400).send({ status: false, message: "No such cart exist" })
        }

        //check if user exist-
        let isUserExist = await userModel.findById(userId)

        if (!isUserExist) {
            return res.status(400).send({ status: false, message: "User doesn't exist" })
        }


        let deletedProduct = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

        return res.status(200).send({ status: true, message: true, data: deletedProduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}





module.exports.createCart= createCart
module.exports.getCart = getCart
module.exports.deleteProduct = deleteProduct