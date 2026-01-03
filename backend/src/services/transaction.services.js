const Transaction= require('../models/transaction.model');
// Create Transaction
async function createTransaction(data){
    return await Transaction.create(data);
}
// Get All Transactions
async function getTransactions(){
    return await Transaction.find();
}
// Update Transaction
async function updateTransaction(userId,data){
    return await Transaction.findByIdAndUpdate(userId,data,{new:true});
}
// Delete Transaction
async function deleteTransaction(userId,data){
    return await Transaction.findByIdAndDelete(userId,data);
}
module.exports={
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction
};