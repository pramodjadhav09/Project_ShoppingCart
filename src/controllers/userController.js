const userModel= require("../models/userModel")





const createUser = async function (req,res){
    let data=req.body;
    let userData= await userModel.create(data)

    return res.status(201).send({status:true, message:"User created successfully", data:userData})
}

module.exports.createUser=createUser