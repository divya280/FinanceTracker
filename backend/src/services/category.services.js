const Category = require('../models/category.model');

const DEFAULT_CATEGORIES = [
    { name: 'Salary', type: 'income', color: '#22c55e' },
    { name: 'Freelance', type: 'income', color: '#10b981' },
    { name: 'Investment', type: 'income', color: '#14b8a6' },
    { name: 'Food', type: 'expense', color: '#ef4444' },
    { name: 'Transport', type: 'expense', color: '#f97316' },
    { name: 'Shopping', type: 'expense', color: '#f59e0b' },
    { name: 'Bills', type: 'expense', color: '#8b5cf6' },
    { name: 'Entertainment', type: 'expense', color: '#ec4899' },
    { name: 'Health', type: 'expense', color: '#06b6d4' },
    { name: 'Other', type: 'expense', color: '#6b7280' },
];

// Create Category
async function createCategory(data) {
    return await Category.create(data);
}

// Get Categories by User (auto-seeds defaults for a brand new user)
async function getCategoriesByUser(userId) {
    const existing = await Category.find({ userId }).sort({ type: 1, name: 1 });
    if (existing.length > 0) return existing;

    const seeded = await Category.insertMany(
        DEFAULT_CATEGORIES.map(c => ({ ...c, userId }))
    );
    return seeded.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}

// Update Category
async function updateCategory(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true });
}

// Delete Category
async function deleteCategory(id) {
    return await Category.findByIdAndDelete(id);
}

module.exports = {
    createCategory,
    getCategoriesByUser,
    updateCategory,
    deleteCategory,
};
