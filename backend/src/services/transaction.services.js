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
// Get Transactions by User, optionally filtered by date range/type/category/search,
// and paginated when page/limit are provided (returns {data,total,page,totalPages}
// instead of a plain array in that case, for backward compatibility with existing callers).
async function getTransactionsByUser(userId, filters = {}) {
    const query = { userId };
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.search) query.description = { $regex: filters.search, $options: 'i' };
    if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = new Date(filters.startDate);
        if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    if (!filters.page && !filters.limit) {
        return await Transaction.find(query).sort({ date: -1 });
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const [data, total] = await Promise.all([
        Transaction.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
        Transaction.countDocuments(query),
    ]);
    return { data, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
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
// Get monthly income/expense totals for the last N months (oldest to newest)
async function getMonthlySummary(userId, months = 6) {
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const results = await Transaction.aggregate([
        { $match: { userId, date: { $gte: rangeStart } } },
        {
            $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
                total: { $sum: "$amount" },
            },
        },
    ]);

    const totalsByKey = {};
    for (const r of results) {
        const key = `${r._id.year}-${r._id.month}`;
        if (!totalsByKey[key]) totalsByKey[key] = { income: 0, expense: 0 };
        totalsByKey[key][r._id.type] = r.total;
    }

    const output = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const totals = totalsByKey[key] || { income: 0, expense: 0 };
        output.push({ year: d.getFullYear(), month: d.getMonth() + 1, income: totals.income, expense: totals.expense });
    }
    return output;
}

module.exports={
    createTransaction,
    getTransactions,
    getTransactionsByUser,
    getUserSummary,
    getMonthlySummary,
    updateTransaction,
    deleteTransaction
};