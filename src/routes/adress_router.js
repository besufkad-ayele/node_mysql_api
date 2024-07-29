const express = require('express');
const router = express.Router();

const { authenticateToken, checkRole } = require('../../services/middleware/authenticateToken');

const adressController = require('../controller/address_controller');

// GET /api/adresses
router.get('/', authenticateToken, adressController.getallAdress);

// POST /api/roles
router.post('/', authenticateToken, adressController.addAddress);

module.exports = router;

