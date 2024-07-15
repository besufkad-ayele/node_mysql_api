const express = require('express');
const router = express.Router();

// Import route handlers
//here the example how to make these line in one if needed
// const usersRouter = require('./users');
const roleRouter = require('./role');
const catagoryRouter = require('./catagory');
const restaurantRouter = require('./restaurant');
const addressRouter = require('./adress');
const foodRouter = require('./food');
const contentRouter = require('./content');
const menuRouter = require('./menu');
const orderRouter = require('./order');
const grouporderRouter = require('./grouporder');
const groupordermemberRouter = require('./groupmembers');
const paymentRouter = require('./payment');
const ratingRouter = require('./rating');

// Mount routers
//use to be two line but now done in one 
router.use('/users',  require('./users'));
router.use('/role', roleRouter);
router.use('/catagory', catagoryRouter);
router.use('/restaurant', restaurantRouter);
router.use('/address', addressRouter);
router.use('/content', contentRouter);
router.use('/food', foodRouter);
router.use('/menu', menuRouter);
router.use('/order', orderRouter);
router.use('/grouporder', grouporderRouter);
router.use('/groupordermember', groupordermemberRouter);
router.use('/payment', paymentRouter);
router.use('/rating', ratingRouter);

module.exports = router;