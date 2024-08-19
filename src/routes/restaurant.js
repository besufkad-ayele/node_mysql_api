const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticateToken } = require('../middleware/authenticateToken');
const restaurantController = require('../controller/restaurant_controller');

// Get all restaurants
router.get('/', authenticateToken, restaurantController.getAllRestaurants);

// Get restaurant by ID
router.get('/:id', authenticateToken, restaurantController.getRestaurantById);

// Update restaurant by ID
router.put('/:id', authenticateToken, restaurantController.updateRestaurantById);

// Delete restaurant by ID
router.delete('/:id', authenticateToken, restaurantController.deleteRestaurantById);

// Add new restaurant
router.post(
    '/',
    [
        authenticateToken,
        check('name', 'Name is required').not().isEmpty(),
        check('phone', 'Phone is required').not().isEmpty(),
        check('category_id', 'Category ID is required').isInt(),
    ],
    restaurantController.addRestaurant
);

module.exports = router;
