const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

// Create a connection to MySQL database
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Function to create tables if they don't exist
function createTablesIfNotExist() {
    //sql query to add one column to table
    const sqlQueries = [
        `CREATE TABLE IF NOT EXISTS Role (
            role_id INT PRIMARY KEY AUTO_INCREMENT,
            role_name VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Users (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL UNIQUE,
            role_id INT NOT NULL,
            FOREIGN KEY (role_id) REFERENCES Role(role_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Category (
            category_id INT PRIMARY KEY AUTO_INCREMENT,
            category_name VARCHAR(50) NOT NULL,
            category_type VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Restaurants (
            restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            image VARCHAR(255),
            category_id INT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES Category(category_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Customer_Address (
            address_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            state VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Restaurant_Address (
            address_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_id INT NOT NULL,
            state VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Food_Content (
            content_id INT PRIMARY KEY AUTO_INCREMENT,
            calories FLOAT NOT NULL,
            protein FLOAT NOT NULL,
            fat FLOAT NOT NULL,
            carbs FLOAT,
            fiber FLOAT,
            is_spicy BOOLEAN NOT NULL,
            serving_size VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS Food (
            food_id INT PRIMARY KEY AUTO_INCREMENT,
            category_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image VARCHAR(255),
            content_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES Category(category_id),
            FOREIGN KEY (content_id) REFERENCES Food_Content(content_id),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Menu (
            menu_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_id INT NOT NULL,
            food_id INT NOT NULL,
            discount DECIMAL(5, 2) DEFAULT 0,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
            FOREIGN KEY (food_id) REFERENCES Food(food_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Favorite_Food (
            favorite_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            menu_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (menu_id) REFERENCES Menu(menu_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Drivers (
            driver_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            location VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            driver_type ENUM('bicycle', 'motorcycle', 'car') DEFAULT 'bicycle',
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS Orders (
            order_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            driver_id INT,
            restaurant_id INT NOT NULL,
            total_order DECIMAL(10, 2) NOT NULL,
            delivery_status VARCHAR(20) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id) ON DELETE SET NULL,
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS Payment (
            payment_id INT PRIMARY KEY AUTO_INCREMENT,
            order_id INT NOT NULL,
            payment_method VARCHAR(20) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Group_Order (
            group_order_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_id INT NOT NULL,
            group_owner_id INT NOT NULL,
            status VARCHAR(50),
            group_name VARCHAR(100),
            invitation_code VARCHAR(20),
            payment_method VARCHAR(20),
            payment_status VARCHAR(20),
            payment_type ENUM('owner_pays', 'split_evenly', 'pay_own_order') DEFAULT 'owner_pays',
            total_group_order DECIMAL(10, 2),
            driver_id INT,
            delivery_status VARCHAR(20) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
            FOREIGN KEY (group_owner_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Group_Order_Members (
            group_order_member_id INT PRIMARY KEY AUTO_INCREMENT,
            group_order_id INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (group_order_id) REFERENCES Group_Order(group_order_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Customer (
            customer_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            image VARCHAR(255),
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS Rating (
            rating_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            rating DECIMAL(3, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
            review_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id)
        )`
    ];
    // Connect to MySQL
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL Xammp: ' + err.stack);
            return;
        }
        console.log('Connected to MySQL as id ' + connection.threadId);

        // Create the database if it doesn't exist
        connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`, (err) => {
            if (err) {
                console.error('Error creating database: ' + err.stack);
                return;
            }
            console.log(`Database "${process.env.DATABASE}" created or already exists`);

            // Use the database
            connection.query(`USE ${process.env.DATABASE}`, (err) => {
                if (err) {
                    console.error('Error using database: ' + err.stack);
                    return;
                }
                console.log(`Using database "${process.env.DATABASE}" From "${process.env.DATABASE.length}" Databases`);

                // Execute each table creation query in sequence
                sqlQueries.forEach((sql) => {
                    connection.query(sql, (err, result) => {
                        if (err) {
                            console.error('Error creating table: ' + err.stack);
                            return;
                        }
                        // console.log('Table created successfully');
                    });
                });
            });
        });
    });

}

exports.createTablesIfNotExist = createTablesIfNotExist;
exports.connection = connection;