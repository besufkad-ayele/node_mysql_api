const express = require('express');
const router = express.Router();
const authController = require('../controller/auth_controller');

router.post('/token', authController.token);

module.exports = router;
