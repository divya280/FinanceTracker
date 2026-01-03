const transactionService = require('../services/transaction.services');
const { transactionSchema } = require('../schema/transaction.schema');

exports.createTransaction = async (req, res) => {
    try {
        const validated = transactionSchema.parse(req.body);
        const transaction = await transactionService.createTransaction(validated);
        res.status(201).json(transaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
// Get all (alias)
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await transactionService.getTransactions();
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get by userId
exports.getTransactionsByUser = async (req, res) => {
    try {
        const transactions = await transactionService.getTransactionsByUser(req.params.userId);
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const updated = await transactionService.updateTransaction(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteTransaction = async (req, res) => {
    try {
        await transactionService.deleteTransaction(req.params.id);
        res.status(200).json({ message: "Transaction deleted" });        
    }catch (err) {
        res.status(500).json({ error: err.message });
    }
};