const { z } = require('zod');
const categorySchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(['income', 'expense'], "Type must be either 'income' or 'expense'"),
    color: z.string().optional(),
});
module.exports = { categorySchema };
