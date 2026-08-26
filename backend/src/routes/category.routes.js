const express = require('express');
const categoryController = require('../controllers/category.controller');
const verifyToken = require('../middleware/auth.middleware');
const router = express.Router();

router.use(verifyToken);

router.post('/', categoryController.createCategory);
router.get('/user/:userId', categoryController.getCategoriesByUser);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
module.exports = router;
