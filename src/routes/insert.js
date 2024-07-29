const express = require('express');
const router = express.Router();

// Import route handlers
//here the example how to make these line in one if needed
// const usersRouter = require('./users');

const roleRouter = require('../routes/role_route');
const addressRouter = require('../routes/adress_router');
const foodRouter = require('./food');
const catagoryRouter = require('./catagory');
const restaurantRouter = require('./restaurant');
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
router.use('/roles', roleRouter);
router.use('/categories', catagoryRouter);
router.use('/restaurants', restaurantRouter);
router.use('/address', addressRouter);
router.use('/contents', contentRouter);
router.use('/foods', foodRouter);
router.use('/menus', menuRouter);
router.use('/orders', orderRouter);
router.use('/grouporders', grouporderRouter);
router.use('/groupordermembers', groupordermemberRouter);
router.use('/payments', paymentRouter);
router.use('/ratings', ratingRouter);

module.exports = router;