const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { authenticateToken, checkRole } = require('../../services/middleware/authenticateToken');
const db = require('../../config/db');

// Get all restaurants
router.get('/', authenticateToken, (req, res) => {
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

// Get restaurant by ID
router.get('/:id', authenticateToken, (req, res) => {
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

// Update restaurant by ID
router.put('/:id', authenticateToken, (req, res) => {
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

// Delete restaurant by ID
router.delete('/:id', authenticateToken, (req, res) => {
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
      authenticateToken,
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
      console.log('User:', req.user);

      if (category_id == 2) {
        const sql = 'INSERT INTO Restaurants (name, phone, category_id) VALUES (?, ?, ?)';
        const values = [name, phone, category_id];
  
        db.connection.query(sql, values, (err, result) => {
          if (err) {
            console.error('Error adding restaurant:', err);
            return res.status(500).json({ error: 'Failed to add restaurant' });
          }

          res.json({ message: 'Restaurant added successfully', restaurant_id: result.insertId });
        });
      } else {
        res.status(403).json({ message: 'You are not allowed to add a restaurant. Only Admins are allowed.' });
      }
    }
);

module.exports = router;