const express=require('express');
const userController=require('../controllers/user.controller');
const router=express.Router();
router.post('/',userController.createUser);
router.get('/',userController.getUsers);
    
router.put('/:data',userController.updateUser);
router.delete('/:id',userController.deleteUser);
module.exports=router;