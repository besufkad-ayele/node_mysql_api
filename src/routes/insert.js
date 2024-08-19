const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/authenticateToken');
const db = require('../config/db');

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

//create trial api with just / 
router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});
router.get('/here', authenticateToken,(req, res) => {
    email = req.user.email;
    console.log(email);
    //checke for email form database 
    db.connection.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No users found' });
        }
        res.json({ success: true, message: 'API is working', data: results });
    });
});
// router.get('/here',asyncHandler(async (req, res) => {
//     res.json({ message: 'API is working' });
// }));
module.exports = router;