const mongoose=require("mongoose");
const userModel=new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    firebaseUid:{type:String, required:true, unique:true},
},
{timestamps:true}

);
module.exports=mongoose.model('User',userModel);