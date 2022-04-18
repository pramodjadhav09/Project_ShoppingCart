const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const validator = require('../validator/validator')




//CreateCart--------------------


const createCart = async function (req, res) {
    let userId = req.params.userId;
    let productId = req.body.items[0].productId;
    let quantity = req.body.items[0].quantity;

    try {

        let UserCart = await cartModel.findOne({ userId: userId });

        let productIdPresent = await productModel.findOne({ _id: productId })

        if (!productIdPresent) {
            return res.status(400).send({ status: false, message: "false", data: "product is not present" })
        }

        let price = productIdPresent.price;

        if (UserCart) {

            let itemsIndex = UserCart.items.findIndex((item) => (item.productId == productId))

            if (itemsIndex > -1) {

                let product = UserCart.items[itemsIndex];
                product.quantity = product.quantity + quantity;

                UserCart.items[itemsIndex] = product;
                UserCart.totalPrice = UserCart.totalPrice + price * quantity;
                UserCart.totalItems = UserCart.totalItems + quantity
                await UserCart.save();
                return res.status(200).send(UserCart);

            } else {

                UserCart.items.push({ productId, quantity });
                UserCart.totalPrice = UserCart.totalPrice + price * quantity;
                UserCart.totalItems = UserCart.totalItems + quantity
                await UserCart.save();
                return res.status(200).send(UserCart)
            }


            //no cart exists, create one

        } else {
            const newUserCart = await cartModel.create({
                userId: userId,
                items: [{ productId, quantity }],
                totalPrice: quantity * price,
                totalItems: quantity
            })

            return res.status(201).send(newUserCart)
        }


    } catch (error) {
        return res.status(500).send({ msg: error.message });
    }
}








//GetCart----------------------------------

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





//UpdateCart---------------------------------



const updateCart = async function (req, res) {

    let cartId = req.body.cartId;
    let productId = req.body.productId;
    let removeProduct = req.body.removeProduct;    // 0 to remove all and 1 to decrement quantity by 1


    //validations-

    if (!validator.isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, msg: "enter a body" });
    }

    if (!validator.isValid(userIdFromParams)) {
        return res.status(400).send({ status: false, msg: "enter the productId" });
    }
    if (!validator.isValidObjectId(userIdFromParams)) {
        return res.status(400).send({ status: false, msg: "enter a valid productId" });
    }



    let isCartIdPresent = await cartModel.findOne({ _id: cartId });
    //  console.log(isCartIdPresent);
    if (!isCartIdPresent) {
        return res.status(400).send({ status: false, msg: "false", data: "Cart Id is not present" })
    }

    let isProductIdPresent = await ProductModel.findOne({ _id: productId });
    //   console.log(isProductIdPresent);
    if (!isProductIdPresent) {
        return res.status(400).send({ status: false, msg: "false", data: "Cart Id is not present" })
    }

    let price = isProductIdPresent.price;

    if (isCartIdPresent) {
        if (removeProduct == 1) {
            let findIndex = isCartIdPresent.items.findIndex((item) => (item.productId == productId))

            if (findIndex > -1) {
                let item = isCartIdPresent.items[findIndex];
                if (item.quantity == 1) {
                    return res.status(400).send({ data: "Product is cannot be less then one" })
                }
                // console.log(item);
                item.quantity = item.quantity - 1;
                // console.log(item);
                isCartIdPresent.totalItems = isCartIdPresent.totalItems - 1;
                isCartIdPresent.totalPrice = isCartIdPresent.totalPrice - price;
                isCartIdPresent.items[findIndex] = item;
                isCartIdPresent.save()
                // let updatedCart = await cartModel.findByIdAndUpdate(cartId,isCartIdPresent,{new:true})
                return res.status(200).send({ status: true, msg: "true", data: isCartIdPresent })

            } else {
                return res.status(400).send({ status: false, msg: "false", data: "Product is not present in cart or its already deleted" })
            }
        } else if (removeProduct == 0) {
            const itemIndex = isCartIdPresent.items.findIndex((item) => (item.productId == productId));
            if (itemIndex > -1) {
                let item = isCartIdPresent.items[itemIndex];
                isCartIdPresent.totalItems = isCartIdPresent.totalItems - item.quantity;
                isCartIdPresent.totalPrice = isCartIdPresent.totalPrice - item.quantity * isProductIdPresent.price;
                isCartIdPresent.items.splice(itemIndex, 1);
                let cart = await isCartIdPresent.save();
                return res.status(200).send({ status: true, msg: "true", data: cart })
            } else {
                return res.status(400).send({ status: false, msg: "false", data: "Product is not present in cart or its already deleted" })
            }

        }
    } else {
        return res.status(400).send({ status: false, msg: "false", data: "Cart is empty for the user" })
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





module.exports = {
    createCart,
    getCart,
    updateCart,
    deleteProduct
}
