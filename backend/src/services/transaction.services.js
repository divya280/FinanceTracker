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
// Get Transactions by User
async function getTransactionsByUser(userId) {
    return await Transaction.find({ userId }).sort({ date: -1 });
}
// Get User Summary (total income, expense, balance)
async function getUserSummary(userId) {
    const transactions = await Transaction.find({ userId });
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length
    };
}
module.exports={
    createTransaction,
    getTransactions,
    getTransactionsByUser,
    getUserSummary,
    updateTransaction,
    deleteTransaction
};