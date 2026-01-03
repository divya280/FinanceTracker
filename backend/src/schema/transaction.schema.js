const {z} = require('zod');
const transactionSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    amount: z.number().positive("Amount must be a positive number"),
    type: z.enum(['income', 'expense'], "Type must be either 'income' or 'expense'"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    
});
module.exports = { transactionSchema } ; 