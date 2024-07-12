const express = require('express');
const router = express.Router();

// Import route handlers
const usersRouter = require('./users');
const roleRouter = require('./role');
const catagoryRouter = require('./catagory');
const restaurantRouter = require('./restaurant');

// Mount routers
router.use('/users', usersRouter);
router.use('/role', roleRouter);
router.use('/catagory', catagoryRouter);
router.use('/restaurant', restaurantRouter);


module.exports = router;
