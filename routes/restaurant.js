const express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection or ORM setup
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authenticateToken');

router.get('/', (req, res) => {
    db.connection.query('SELECT * FROM Restaurants', (err, results) => {
        if (err) {
            console.error('Error fetching Restaurants:', err);
            return res.status(500).json({ error: 'Failed to fetch restaurants' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No restaurants found' });
        }

        res.json(results);
    });
});
 
//what we have to add in here the get method for the restaurant by id
// GET /api/restaurants/:id
router.get('/:id', (req, res) => {
    const restaurantId = req.params.id;
    db.connection.query('SELECT * FROM Restaurants WHERE restaurant_id = ?', [restaurantId], (err, results) => {
        if (err) {
            console.error('Error fetching Restaurant:', err);
            return res.status(500).json({ error: 'Failed to fetch restaurant' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json(results[0]);
    });
});
//to update the resturant by id
// PUT /api/restaurants/:id
router.put('/:id', (req, res) => {
    const restaurantId = req.params.id;
    const restaurantData = req.body; // Assuming JSON payload with restaurant data

    // Validate restaurantData
    if (!restaurantData.name && !restaurantData.phone && !restaurantData.category_id) {
        return res.status(400).json({ error: 'Restaurant name, phone, category_id are required!' });
    }

    // Update restaurantData in the database
    const sql = 'UPDATE Restaurants SET ? WHERE restaurant_id = ?';
    db.connection.query(sql, [restaurantData, restaurantId], (err, result) => {
        if (err) {
            console.error('Error updating Restaurant:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({ message: 'Restaurant updated successfully' });
    });
});


//delete the restaurant by id
// DELETE /api/restaurants/:id
router.delete('/:id', (req, res) => {
    const restaurantId = req.params.id;

    db.connection.query('DELETE FROM Restaurants WHERE restaurant_id = ?', [restaurantId], (err, result) => {
        if (err) {
            console.error('Error deleting Restaurant:', err);
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        res.json({ message: 'Restaurant deleted successfully' });
    });
});

// Add new restaurant
router.post(
    '/',
    [
      authMiddleware,
      check('name', 'Name is required').not().isEmpty(),
      check('phone', 'Phone is required').not().isEmpty(),
      check('category_id', 'Category ID is required').isInt(),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { name, phone, category_id } = req.body;
  
      const sql = 'INSERT INTO Restaurants (name, phone, category_id) VALUES (?, ?, ?)';
      const values = [name, phone, category_id];
  
      db.connection.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error adding restaurant:', err);
          return res.status(500).json({ error: 'Failed to add restaurant' });
        }

        res.json({ message: 'Restaurant added successfully', restaurant_id: result.insertId });
      });
    }
  );
// POST /api/restaurants
//these have been change to the above post method only by the admin
// router.post('/', (req, res) => {
//     const restaurantData = req.body; // Assuming JSON payload with restaurant data
//     // Validate restaurantData
//     if (!restaurantData.name || !restaurantData.phone || !restaurantData.category_id ) {
//         return res.status(400).json({ error: 'Restaurant name, phone, category_id are required!' });
//     }

//     // Insert restaurantData into the database
//     const sql = 'INSERT INTO Restaurants (name, category_id, phone) VALUES (?, ?, ?)';
//     const values = [restaurantData.name, restaurantData.category_id, restaurantData.phone];

//     db.connection.query(sql, values, (err, result) => {
//         if (err) {
//             console.error('Error inserting Restaurant:', err);
//             return res.status(500).json({ error: err.message });
//         }

//         const insertedRestaurant = {
//             restaurant_id: result.insertId,
//             name: restaurantData.name,
//             phone: restaurantData.phone,
//             category_id: restaurantData.category_id
//         };

//         res.json({ message: 'Restaurant created successfully', restaurant: insertedRestaurant });
//     });
// });

// Export the router so it can be mounted in the main application
module.exports = router;
