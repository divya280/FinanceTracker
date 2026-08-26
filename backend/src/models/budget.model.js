const mongoose = require("mongoose");
const budgetModel = new mongoose.Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
},
{ timestamps: true }
);
budgetModel.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });
module.exports = mongoose.model('Budget', budgetModel);
