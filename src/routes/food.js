const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const foodController = require('../controller/food_controller');

// GET /api/food
router.get('/', authenticateToken, foodController.getAllFood);

// GET /api/food/:id
router.get('/:id', authenticateToken, foodController.getFoodById);

// POST /api/food
router.post('/', authenticateToken, foodController.addFood);

// PUT /api/food/:id
router.put('/:id', authenticateToken, foodController.updateFood);

// DELETE /api/food/:id
router.delete('/:id', authenticateToken, foodController.deleteFood);

module.exports = router;
