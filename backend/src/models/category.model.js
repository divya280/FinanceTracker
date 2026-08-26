const mongoose = require("mongoose");
const categoryModel = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    color: { type: String, default: '#6366f1' },
},
{ timestamps: true }
);
categoryModel.index({ userId: 1, name: 1, type: 1 }, { unique: true });
module.exports = mongoose.model('Category', categoryModel);
