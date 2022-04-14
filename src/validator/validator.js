
//VALODATIONFUNCTIONs-

//FUNCTION1-
const isValidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0
}


//FUNCTION2-
const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}


//FUNCTION3-
const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}

//FUNCTION4-
const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}

//FUNCTION5-
let isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}





module.exports.isValid = isValid;
module.exports.isValidRequestBody = isValidRequestBody;
module.exports.isValidPassword = isValidPassword;
module.exports.isValidfiles = isValidfiles;
module.exports.isValidObjectId = isValidObjectId