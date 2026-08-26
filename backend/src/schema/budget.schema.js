const { z } = require('zod');
const budgetSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    category: z.string().min(1, "Category is required"),
    limit: z.number().positive("Limit must be a positive number"),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
});
module.exports = { budgetSchema };
