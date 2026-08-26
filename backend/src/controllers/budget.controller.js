const budgetService = require('../services/budget.services');
const { budgetSchema } = require('../schema/budget.schema');

exports.createBudget = async (req, res) => {
    try {
        const userId = req.user.uid;
        const bodyWithUser = { ...req.body, userId };
        const validated = budgetSchema.parse(bodyWithUser);
        const budget = await budgetService.createBudget(validated);
        res.status(201).json(budget);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBudgetsByUser = async (req, res) => {
    try {
        const now = new Date();
        const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
        const year = req.query.year ? Number(req.query.year) : now.getFullYear();
        const budgets = await budgetService.getBudgetsByUser(req.params.userId, month, year);
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const updated = await budgetService.updateBudget(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        await budgetService.deleteBudget(req.params.id);
        res.status(200).json({ message: "Budget deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
