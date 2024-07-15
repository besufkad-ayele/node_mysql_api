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
    const sqlQueries = [
        // SQL queries to create tables
        `CREATE TABLE IF NOT EXISTS Role (
            role_id INT PRIMARY KEY AUTO_INCREMENT,
            role_name VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Users (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            role_id INT NOT NULL,
            UNIQUE (email),
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
            category_id INT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES Category(category_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Address (
            address_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT,
            restaurant_id INT,
            state VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
            CHECK ((user_id IS NOT NULL AND restaurant_id IS NULL) OR (user_id IS NULL AND restaurant_id IS NOT NULL))
        )`,
        `CREATE TABLE IF NOT EXISTS Content (
            content_id INT PRIMARY KEY AUTO_INCREMENT,
            calories DECIMAL(10, 2) NOT NULL,
            protein DECIMAL(10, 2) NOT NULL,
            fat DECIMAL(10, 2) NOT NULL,
            is_spicy BOOLEAN NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Food (
            food_id INT PRIMARY KEY AUTO_INCREMENT,
            category_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255),
            price DECIMAL(10, 2),
            content_id INT NOT NULL,
            discount DECIMAL(5, 2),
            restaurant_id INT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES Category(category_id),
            FOREIGN KEY (content_id) REFERENCES Content(content_id),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Menu (
            menu_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_id INT NOT NULL,
            food_id INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
            FOREIGN KEY (food_id) REFERENCES Food(food_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Orders (
            order_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            driver_id INT,
            restaurant_id INT NOT NULL,
            order_total DECIMAL(10, 2) NOT NULL,
            delivery_status VARCHAR(20) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(user_id),
            FOREIGN KEY (driver_id) REFERENCES Users(user_id),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Group_order (
            group_order_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_id INT NOT NULL,
            group_owner_id INT NOT NULL,
            status VARCHAR(50),
            invitation_code VARCHAR(20),
            payment_method VARCHAR(20),
            payment_status VARCHAR(20),
            payment_type ENUM('owner_pays', 'split_evenly', 'pay_own_order') DEFAULT 'owner_pays',
            total_amount DECIMAL(10, 2),
            FOREIGN KEY (restaurant_id) REFERENCES Restaurants(restaurant_id),
            FOREIGN KEY (group_owner_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Group_order_members (
            group_order_member_id INT PRIMARY KEY AUTO_INCREMENT,
            group_order_id INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (group_order_id) REFERENCES Group_order(group_order_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Drivers (
            driver_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            location VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            driver_type ENUM('bicycle', 'motorcycle', 'car') DEFAULT 'bicycle'
        )`,
        `CREATE TABLE IF NOT EXISTS Payment (
            payment_id INT PRIMARY KEY AUTO_INCREMENT,
            order_id INT NOT NULL,
            payment_method VARCHAR(20) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id)
        )`,
        `CREATE TABLE IF NOT EXISTS rating (
            rating_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            rating DECIMAL(3, 1) NOT NULL,
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
            console.error('Error connecting to MySQL: ' + err.stack);
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
