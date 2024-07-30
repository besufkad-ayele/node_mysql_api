const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../services/middleware/authenticateToken');
const ratingController = require('../controller/rating_controller');

// POST /api/rating
router.post('/', authenticateToken, ratingController.createRating);

// GET /api/rating
router.get('/', authenticateToken, ratingController.getAllRatings);

// GET /api/rating/:id
router.get('/:id', authenticateToken, ratingController.getRatingById);

// PUT /api/rating/:id
router.put('/:id', authenticateToken, ratingController.updateRating);

// DELETE /api/rating/:id
router.delete('/:id', authenticateToken, ratingController.deleteRating);

module.exports = router;
