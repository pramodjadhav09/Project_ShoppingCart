const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId




const cartSchema = new mongoose.Schema({
    userId: {
        type: objectId,
        required: true,
        unique: true,
        ref: "user"
    },
    items: [{
        productId: {
            type: objectId,
            required: true,
            ref: "product"
        },
        quantity: {
            type: Number,
            required: true,
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    totalItems: {
        type: Number,
        required: true
    }
}, { timestamps: true })


module.exports = mongoose.model('cart', cartSchema)


