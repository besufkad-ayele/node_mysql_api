const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/authenticateToken');
const categoryController = require('../controller/category_controller');

router.get('/', authenticateToken, categoryController.getAllCategories);
router.delete('/:id', authenticateToken, categoryController.deleteCategory);
router.put('/:id', authenticateToken, categoryController.updateCategory);
router.post('/', authenticateToken, categoryController.addCategory);

module.exports = router;
