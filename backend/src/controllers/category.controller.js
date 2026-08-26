const categoryService = require('../services/category.services');
const { categorySchema } = require('../schema/category.schema');

exports.createCategory = async (req, res) => {
    try {
        const userId = req.user.uid;
        const bodyWithUser = { ...req.body, userId };
        const validated = categorySchema.parse(bodyWithUser);
        const category = await categoryService.createCategory(validated);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getCategoriesByUser = async (req, res) => {
    try {
        const categories = await categoryService.getCategoriesByUser(req.params.userId);
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updated = await categoryService.updateCategory(req.params.id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.status(200).json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
