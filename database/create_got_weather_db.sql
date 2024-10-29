CREATE DATABASE IF NOT EXISTS got_weather_db;
USE got_weather_db;

DROP TABLE IF EXISTS ACCOUNT_T;

-- Optional: Print a message indicating success
SELECT 'ACCOUNT_T table deleted successfully.' AS status;

CREATE TABLE ACCOUNT_T (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    user_email VARCHAR(100),
    user_password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_location VARCHAR(50),
    favorite_location VARCHAR(50)
);
CREATE DATABASE IF NOT EXISTS got_weather_db;
USE got_weather_db;

CREATE TABLE IF NOT EXISTS ACCOUNT_T (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    user_email VARCHAR(100) UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    user_location VARCHAR(50),
    favorite_location VARCHAR(50)
);

-- Insert 30 example users with real-world locations, only if the username or email does not already exist
INSERT IGNORE INTO ACCOUNT_T (username, user_email, user_password, user_location, favorite_location) VALUES
('johndoe', 'johndoe123@example.com', 'password123', 'New York', 'Paris'),
('janedoe', 'janedoe456@example.com', 'password456', 'Los Angeles', 'Tokyo'),
('alexsmith', 'alexsmith789@example.com', 'password789', 'Chicago', 'Sydney'),
('maryjohnson', 'maryj@example.com', 'pass1234', 'Houston', 'London'),
('emilybrown', 'emilyb@example.com', 'password555', 'Phoenix', 'Rome'),
('davidthomas', 'dthomas@example.com', 'password2024', 'Philadelphia', 'Berlin'),
('sarahwilson', 'swilson@example.com', 'mypassword', 'San Antonio', 'Amsterdam'),
('michaeljones', 'michael.jones@example.com', 'pw123456', 'San Diego', 'Vancouver'),
('elizabethmoore', 'liz.moore@example.com', 'ilovecats', 'Dallas', 'Barcelona'),
('chrismiller', 'chris.m@example.com', 'letmein', 'San Jose', 'Istanbul'),
('amandagarcia', 'amanda.g@example.com', 'password321', 'Austin', 'Dubai'),
('williammartin', 'wmartin@example.com', 'password123', 'Jacksonville', 'Moscow'),
('victoriarodriguez', 'vrodriguez@example.com', 'hunter2', 'San Francisco', 'Seoul'),
('johnwalker', 'john.walker@example.com', 'password456', 'Columbus', 'Bangkok'),
('danielyoung', 'daniel.young@example.com', 'qwerty123', 'Fort Worth', 'Buenos Aires'),
('angelahernandez', 'angela.h@example.com', 'abc12345', 'Charlotte', 'Cape Town'),
('robertdavis', 'robert.d@example.com', 'securepass', 'Detroit', 'Rio de Janeiro'),
('jennifertaylor', 'j.taylor@example.com', 'mysecret', 'El Paso', 'Lisbon'),
('susanwhite', 's.white@example.com', 'passpass', 'Seattle', 'Prague'),
('matthewperez', 'm.perez@example.com', 'newpassword', 'Denver', 'Hong Kong'),
('lindaclark', 'linda.c@example.com', 'guest1234', 'Washington', 'Mexico City'),
('josephlewis', 'joe.lewis@example.com', 'mypassword123', 'Boston', 'Stockholm'),
('lisahall', 'lisa.h@example.com', 'password789', 'Nashville', 'Vienna'),
('jamesallen', 'james.a@example.com', 'password4567', 'Baltimore', 'Madrid'),
('nancyking', 'nancy.k@example.com', 'supersecret', 'Louisville', 'Athens'),
('scottwright', 'scott.w@example.com', 'letmein123', 'Portland', 'Cairo'),
('karendavis', 'karen.d@example.com', 'opensesame', 'Oklahoma City', 'Oslo'),
('patrickgreen', 'patrick.g@example.com', 'password000', 'Las Vegas', 'Kuala Lumpur'),
('sharonadams', 'sharon.a@example.com', 'mypass123', 'Milwaukee', 'Warsaw'),
('haroldcarter', 'harold.c@example.com', 'hello1234', 'Albuquerque', 'Helsinki');