const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const router = express.Router();

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/user/:userId', transactionController.getTransactionsByUser);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
module.exports = router;    