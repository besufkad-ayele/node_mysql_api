const db = require('../config/db');
const { validationResult } = require('express-validator');

// Get all restaurants with category details
// Get all restaurants with category details, menu items, food details, and content details
const getAllRestaurants = (req, res) => {
    db.connection.query(
        `SELECT Restaurants.*, 
                Restaurants.image AS restaurant_image,
                Category.category_id AS category_id,
                Category.category_name AS category_name, 
                Category.category_type AS category_type,
                Menu.menu_id,
                Menu.food_id,
                Menu.price AS menu_price,
                Menu.discount AS menu_discount,
                Food.name AS food_name,
                Food.image AS food_image,
                Food.category_id AS food_category_id,
                Food.isfavorite AS food_isfavorite,
                Content.calories AS food_calories,
                Content.protein AS food_protein,
                Content.fat AS food_fat,
                Content.is_spicy AS food_is_spicy,
                Address.state AS address_state,
                Address.city AS address_city,
                Address.street AS address_street,
                Address.latitude AS address_latitude,
                Address.longitude AS address_longitude,
                GROUP_CONCAT(
                    CONCAT_WS(' | ', Rating.rating, Rating.review_message)
                    ORDER BY Rating.created_at DESC
                    SEPARATOR ' || '
                ) AS restaurant_ratings
         FROM Restaurants
         JOIN Category ON Restaurants.category_id = Category.category_id
         LEFT JOIN Menu ON Restaurants.restaurant_id = Menu.restaurant_id
         LEFT JOIN Food ON Menu.food_id = Food.food_id
         LEFT JOIN Content ON Food.content_id = Content.content_id
         LEFT JOIN Address ON Restaurants.restaurant_id = Address.restaurant_id
         LEFT JOIN Rating ON Restaurants.restaurant_id = Rating.restaurant_id
         GROUP BY Restaurants.restaurant_id, Restaurants.name, Restaurants.image, Category.category_id, Category.category_name, Category.category_type, Menu.menu_id, Menu.food_id, Menu.price, Menu.discount, Food.name, Food.image, Food.category_id, Food.isfavorite, Content.calories, Content.protein, Content.fat, Content.is_spicy, Address.state, Address.city, Address.street, Address.latitude, Address.longitude`,
        (err, results) => {
            if (err) {
                console.error('Error fetching restaurants with details:', err);
                return res.status(500).json({ error: 'Failed to fetch restaurants' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No restaurants found' });
            }

            // Organize the results by restaurant
            const restaurants = {};
            results.forEach(row => {
                if (!restaurants[row.restaurant_id]) {
                    restaurants[row.restaurant_id] = {
                        restaurant_id: row.restaurant_id,
                        name: row.name,
                        restaurant_image: row.restaurant_image,
                        phone: row.phone,
                        category: {
                            category_id: row.category_id,
                            category_name: row.category_name,
                            category_type: row.category_type
                        },
                        address: row.address_state ? {
                            state: row.address_state,
                            city: row.address_city,
                            street: row.address_street,
                            latitude: row.address_latitude,
                            longitude: row.address_longitude
                        } : null,
                        menu_items: [],
                        ratings: row.restaurant_ratings ? row.restaurant_ratings.split(' || ').map(rating => {
                            const [ratingValue, reviewMessage] = rating.split(' | ');
                            return { rating: parseFloat(ratingValue), review_message: reviewMessage };
                        }) : []
                    };
                }

                if (row.menu_id) {
                    restaurants[row.restaurant_id].menu_items.push({
                        menu_id: row.menu_id,
                        food: {
                            food_id: row.food_id,
                            name: row.food_name,
                            food_image: row.food_image,
                            isfavorite: row.food_isfavorite,  // Added isfavorite
                            category: {
                                category_id: row.food_category_id,
                                category_name: row.category_name, // use category_name from the query
                                category_type: row.category_type // use category_type from the query
                            },
                            content: {
                                calories: row.food_calories,
                                protein: row.food_protein,
                                fat: row.food_fat,
                                is_spicy: row.food_is_spicy
                            }
                        },
                        price: row.menu_price,
                        discount: row.menu_discount
                    });
                }
            });

            // Convert object to array
            const formattedResults = Object.values(restaurants);
            res.json({ data: formattedResults });
        }
    );
};




// Get restaurant by ID
const getRestaurantById = (req, res) => {
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
};

// Update restaurant by ID
const updateRestaurantById = (req, res) => {
    const restaurantId = req.params.id;
    const restaurantData = req.body;

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
};

// Delete restaurant by ID
const deleteRestaurantById = (req, res) => {
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
};

// Add new restaurant
const addRestaurant = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, category_id } = req.body;

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
};

module.exports = {
    getAllRestaurants,
    getRestaurantById,
    updateRestaurantById,
    deleteRestaurantById,
    addRestaurant
};
