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
        `CREATE TABLE IF NOT EXISTS Food_Category (
            food_category_id INT PRIMARY KEY AUTO_INCREMENT,
            food_category_name VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Restaurant_Category (
            restaurant_category_id INT PRIMARY KEY AUTO_INCREMENT,
            restaurant_category_name VARCHAR(50) NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS Restaurants (
            restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            image VARCHAR(255),
            restaurant_category_id INT NOT NULL,
            FOREIGN KEY (restaurant_category_id) REFERENCES Restaurant_Category(restaurant_category_id)
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
            food_category_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            image VARCHAR(255),
            content_id INT NOT NULL,
            restaurant_id INT NOT NULL,
            FOREIGN KEY (food_category_id) REFERENCES Food_Category(food_category_id),
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
            name VARCHAR(255),
            user_id INT NOT NULL UNIQUE,
            image VARCHAR(255),
            location VARCHAR(255) NOT NULL,
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
            user_id INT NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            image VARCHAR(255),
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS Delivery_Address (
            address_id INT PRIMARY KEY AUTO_INCREMENT,
            address_type ENUM('order', 'group_order') NOT NULL,
            order_id INT,
            group_order_id INT,
            state VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            street VARCHAR(255) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
            FOREIGN KEY (group_order_id) REFERENCES Group_Order(group_order_id) ON DELETE CASCADE,
            CHECK ((order_id IS NOT NULL AND group_order_id IS NULL) OR (order_id IS NULL AND group_order_id IS NOT NULL))
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
                //PRINT THE NUMBER OF TABLES IN THE DATABASE
                connection.query("SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = ?", [process.env.DATABASE], (err, result) => {
                    if (err) {
                        console.error('Error counting tables: ' + err.stack);
                        return;
                    }
                    console.log(`Number of tables in the database: ${result[0].tableCount}`);
                });

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