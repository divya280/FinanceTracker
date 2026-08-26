const Budget = require('../models/budget.model');
const Transaction = require('../models/transaction.model');

// Create Budget
async function createBudget(data) {
    return await Budget.create(data);
}

// Get Budgets by User for a given month/year, with amount spent per category
async function getBudgetsByUser(userId, month, year) {
    const budgets = await Budget.find({ userId, month, year }).sort({ category: 1 });
    if (budgets.length === 0) return [];

    const rangeStart = new Date(year, month - 1, 1);
    const rangeEnd = new Date(year, month, 1);

    const transactions = await Transaction.find({
        userId,
        type: 'expense',
        category: { $in: budgets.map(b => b.category) },
        date: { $gte: rangeStart, $lt: rangeEnd },
    });

    const spentByCategory = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    return budgets.map(b => ({
        ...b.toObject(),
        spent: spentByCategory[b.category] || 0,
    }));
}

// Update Budget
async function updateBudget(id, data) {
    return await Budget.findByIdAndUpdate(id, data, { new: true });
}

// Delete Budget
async function deleteBudget(id) {
    return await Budget.findByIdAndDelete(id);
}

module.exports = {
    createBudget,
    getBudgetsByUser,
    updateBudget,
    deleteBudget,
};
