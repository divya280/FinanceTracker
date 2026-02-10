const mongoose=require("mongoose");
const transactionModel=new mongoose.Schema({
    userId:{type: String, required:true},
    amount:{type:Number, required:true},
    type:{type:String, required:true, enum:['income','expense']}, 
    category:{type:String, required:true},
   
    description:{type:String},
    date: {type: Date, required: true},
},
{timestamps:true}
);
module.exports=mongoose.model('Transaction',transactionModel);