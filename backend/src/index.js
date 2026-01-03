const express=require('express');
const userRoutes=require('./routes/user.routes');
const transactionRoutes=require('./routes/transaction.routes');
const router=express.Router();
router.use('/users',userRoutes);
router.use('/transactions',transactionRoutes);
module.exports=router;