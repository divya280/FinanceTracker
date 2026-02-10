const express=require('express');
const userController=require('../controllers/user.controller');
const verifyToken = require('../middleware/auth.middleware');
const router=express.Router();

router.post('/sync', verifyToken, userController.syncUser);
router.get('/', verifyToken, userController.getUsers); // Protect if needed
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);
module.exports=router;