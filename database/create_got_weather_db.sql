CREATE DATABASE IF NOT EXISTS got_weather_db;
USE got_weather_db;

-- Drop existing ACCOUNT_T table and create a new one with updated structure
DROP TABLE IF EXISTS ACCOUNT_T;

CREATE TABLE ACCOUNT_T (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    user_email VARCHAR(100) UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    favorite_location VARCHAR(50),
    user_location VARCHAR(50),
    account_creation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    latest_login_timestamp DATETIME DEFAULT NULL
);
