const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const bcrypt = require('bcrypt')

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
});

// POST endpoint to add a new restaurant
app.post('/restaurants', (req, res) => {
    const { name, location, rating, imageUrl, category_id } = req.body;

    const insertRestaurantQuery = `
        INSERT INTO restaurants (name, location, rating, imageUrl, category_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertRestaurantQuery, [name, location, rating, imageUrl, category_id], (err, result) => {
        if (err) {
            res.status(500).send('Error adding restaurant');
            return;
        }
        res.status(201).send('Restaurant added successfully');
    });
});

// GET endpoint to fetch all restaurants
app.get('/restaurants', (req, res) => {
    const getAllRestaurantsQuery = `
        SELECT * FROM restaurants
    `;
    
    db.query(getAllRestaurantsQuery, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching restaurants');
            return;
        }
        res.status(200).json(results);
    });
});

// POST endpoint to add a new food
app.post('/foods', (req, res) => {
    const { name, description, price, imageUrl, category_id } = req.body;

    const insertFoodQuery = `
        INSERT INTO foods (name, description, price, imageUrl, category_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertFoodQuery, [name, description, price, imageUrl, category_id], (err, result) => {
        if (err) {
            res.status(500).send('Error adding food'+`${err.sqlMessage}`);
            return;
        }
        res.status(201).send('Food added successfully');
    });
});

// GET endpoint to fetch all foods
app.get('/foods', (req, res) => {
    const getAllFoodsQuery = `
        SELECT * FROM foods
    `;
    
    db.query(getAllFoodsQuery, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching foods');
            return;
        }
   
        res.status(200).json(results);
    });
});


//login and registration in here
app.post('/register', async (req, res) => {
    const { email, password, name, image, location } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users table
        const insertUserQuery = `
            INSERT INTO users (email, password)
            VALUES (?, ?)
        `;
        db.query(insertUserQuery, [email, hashedPassword], async (err, result) => {
            if (err) {
                res.status(500).send('Error registering user '+`${err.message}`);
                return;
            }
            const userId = result.insertId;

            // Insert into user_details table
            const insertUserDetailsQuery = `
                INSERT INTO user_details (user_id, name, image, location)
                VALUES (?, ?, ?, ?)
            `;
            db.query(insertUserDetailsQuery, [userId, name, image, location], (err, result) => {
                if (err) {
                    res.status(500).send('Error registering user details');
                    return;
                }
                res.status(201).send('User registered successfully');
            });
        });
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// GET endpoint to fetch all foods
app.get('/users', (req, res) => {
    const getAllFoodsQuery = `
        SELECT * FROM users
    `;
    
    db.query(getAllFoodsQuery, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching users');
            return;
        }
        res.status(200).json(results);
    });
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const findUserQuery = `
            SELECT * FROM users WHERE email = ?
        `;
        db.query(findUserQuery, [email], async (err, results) => {
            if (err || results.length === 0) {
                res.status(401).send('Invalid credentials');
                return;
            }

            const user = results[0];
            // Compare password
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                res.status(401).send('Invalid credentials');
                return;
            }

            res.status(200).send('Login successful');
        });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
