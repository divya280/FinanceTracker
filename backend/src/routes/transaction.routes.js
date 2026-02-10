const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middleware/auth.middleware');
const router = express.Router();

router.use(verifyToken); // Protect all transaction routes

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/user/:userId', transactionController.getTransactionsByUser);
router.get('/user/:userId/summary', transactionController.getUserSummary);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
module.exports = router;    