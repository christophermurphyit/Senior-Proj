CREATE DATABASE IF NOT EXISTS got_weather_db;
USE got_weather_db;

-- Drop existing table and create a new one without timestamps
DROP TABLE IF EXISTS ACCOUNT_T;

CREATE TABLE ACCOUNT_T (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    user_email VARCHAR(100) UNIQUE,
    user_password VARCHAR(255) NOT NULL,
    favorite_location VARCHAR(50)
);

-- Insert 30 example users with real-world favorite locations
INSERT IGNORE INTO ACCOUNT_T (username, user_email, user_password, favorite_location) VALUES
('johndoe', 'johndoe123@example.com', 'password123', 'Paris'),
('janedoe', 'janedoe456@example.com', 'password456', 'Tokyo'),
('alexsmith', 'alexsmith789@example.com', 'password789', 'Sydney'),
('maryjohnson', 'maryj@example.com', 'pass1234', 'London'),
('emilybrown', 'emilyb@example.com', 'password555', 'Rome'),
('davidthomas', 'dthomas@example.com', 'password2024', 'Berlin'),
('sarahwilson', 'swilson@example.com', 'mypassword', 'Amsterdam'),
('michaeljones', 'michael.jones@example.com', 'pw123456', 'Vancouver'),
('elizabethmoore', 'liz.moore@example.com', 'ilovecats', 'Barcelona'),
('chrismiller', 'chris.m@example.com', 'letmein', 'Istanbul'),
('amandagarcia', 'amanda.g@example.com', 'password321', 'Dubai'),
('williammartin', 'wmartin@example.com', 'password123', 'Moscow'),
('victoriarodriguez', 'vrodriguez@example.com', 'hunter2', 'Seoul'),
('johnwalker', 'john.walker@example.com', 'password456', 'Bangkok'),
('danielyoung', 'daniel.young@example.com', 'qwerty123', 'Buenos Aires'),
('angelahernandez', 'angela.h@example.com', 'abc12345', 'Cape Town'),
('robertdavis', 'robert.d@example.com', 'securepass', 'Rio de Janeiro'),
('jennifertaylor', 'j.taylor@example.com', 'mysecret', 'Lisbon'),
('susanwhite', 's.white@example.com', 'passpass', 'Prague'),
('matthewperez', 'm.perez@example.com', 'newpassword', 'Hong Kong'),
('lindaclark', 'linda.c@example.com', 'guest1234', 'Mexico City'),
('josephlewis', 'joe.lewis@example.com', 'mypassword123', 'Stockholm'),
('lisahall', 'lisa.h@example.com', 'password789', 'Vienna'),
('jamesallen', 'james.a@example.com', 'password4567', 'Madrid'),
('nancyking', 'nancy.k@example.com', 'supersecret', 'Athens'),
('scottwright', 'scott.w@example.com', 'letmein123', 'Cairo'),
('karendavis', 'karen.d@example.com', 'opensesame', 'Oslo'),
('patrickgreen', 'patrick.g@example.com', 'password000', 'Kuala Lumpur'),
('sharonadams', 'sharon.a@example.com', 'mypass123', 'Warsaw'),
('haroldcarter', 'harold.c@example.com', 'hello1234', 'Helsinki');