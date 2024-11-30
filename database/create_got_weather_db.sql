CREATE DATABASE IF NOT EXISTS got_weather_db;
USE got_weather_db;

-- Drop existing table and create a new one with timestamps
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

-- Insert 30 example users with real-world favorite locations
INSERT IGNORE INTO ACCOUNT_T (username, user_email, user_password, favorite_location, account_creation_timestamp) VALUES
('johndoe', 'johndoe123@example.com', 'password123', 'Paris', NOW()),
('janedoe', 'janedoe456@example.com', 'password456', 'Tokyo', NOW()),
('alexsmith', 'alexsmith789@example.com', 'password789', 'Sydney', NOW()),
('maryjohnson', 'maryj@example.com', 'pass1234', 'London', NOW()),
('emilybrown', 'emilyb@example.com', 'password555', 'Rome', NOW()),
('davidthomas', 'dthomas@example.com', 'password2024', 'Berlin', NOW()),
('sarahwilson', 'swilson@example.com', 'mypassword', 'Amsterdam', NOW()),
('michaeljones', 'michael.jones@example.com', 'pw123456', 'Vancouver', NOW()),
('elizabethmoore', 'liz.moore@example.com', 'ilovecats', 'Barcelona', NOW()),
('chrismiller', 'chris.m@example.com', 'letmein', 'Istanbul', NOW()),
('amandagarcia', 'amanda.g@example.com', 'password321', 'Dubai', NOW()),
('williammartin', 'wmartin@example.com', 'password123', 'Moscow', NOW()),
('victoriarodriguez', 'vrodriguez@example.com', 'hunter2', 'Seoul', NOW()),
('johnwalker', 'john.walker@example.com', 'password456', 'Bangkok', NOW()),
('danielyoung', 'daniel.young@example.com', 'qwerty123', 'Buenos Aires', NOW()),
('angelahernandez', 'angela.h@example.com', 'abc12345', 'Cape Town', NOW()),
('robertdavis', 'robert.d@example.com', 'securepass', 'Rio de Janeiro', NOW()),
('jennifertaylor', 'j.taylor@example.com', 'mysecret', 'Lisbon', NOW()),
('susanwhite', 's.white@example.com', 'passpass', 'Prague', NOW()),
('matthewperez', 'm.perez@example.com', 'newpassword', 'Hong Kong', NOW()),
('lindaclark', 'linda.c@example.com', 'guest1234', 'Mexico City', NOW()),
('josephlewis', 'joe.lewis@example.com', 'mypassword123', 'Stockholm', NOW()),
('lisahall', 'lisa.h@example.com', 'password789', 'Vienna', NOW()),
('jamesallen', 'james.a@example.com', 'password4567', 'Madrid', NOW()),
('nancyking', 'nancy.k@example.com', 'supersecret', 'Athens', NOW()),
('scottwright', 'scott.w@example.com', 'letmein123', 'Cairo', NOW()),
('karendavis', 'karen.d@example.com', 'opensesame', 'Oslo', NOW()),
('patrickgreen', 'patrick.g@example.com', 'password000', 'Kuala Lumpur', NOW()),
('sharonadams', 'sharon.a@example.com', 'mypass123', 'Warsaw', NOW()),
('haroldcarter', 'harold.c@example.com', 'hello1234', 'Helsinki', NOW());