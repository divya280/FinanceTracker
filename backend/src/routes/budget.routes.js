const express = require('express');
const budgetController = require('../controllers/budget.controller');
const verifyToken = require('../middleware/auth.middleware');
const router = express.Router();

router.use(verifyToken);

router.post('/', budgetController.createBudget);
router.get('/user/:userId', budgetController.getBudgetsByUser);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
module.exports = router;
