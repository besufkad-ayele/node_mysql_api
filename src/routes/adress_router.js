const express = require('express');
const router = express.Router();

const { authenticateToken, checkRole } = require('../middleware/authenticateToken');
const addressController = require('../controller/address_controller');

// GET /api/addresses
router.get('/', authenticateToken, addressController.getAllAddress);

// POST /api/address
router.post('/', authenticateToken, addressController.addAddress);

module.exports = router;
