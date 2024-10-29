USE got_weather_db;

-- Delete test users by specific usernames or email patterns
DELETE FROM ACCOUNT_T
WHERE username IN (
    'johndoe', 'janedoe', 'alexsmith', 'maryjohnson', 'emilybrown', 
    'davidthomas', 'sarahwilson', 'michaeljones', 'elizabethmoore', 'chrismiller', 
    'amandagarcia', 'williammartin', 'victoriarodriguez', 'johnwalker', 'danielyoung', 
    'angelahernandez', 'robertdavis', 'jennifertaylor', 'susanwhite', 'matthewperez', 
    'lindaclark', 'josephlewis', 'lisahall', 'jamesallen', 'nancyking', 
    'scottwright', 'karendavis', 'patrickgreen', 'sharonadams', 'haroldcarter'
) OR user_email LIKE '%example.com';

-- Optional: To confirm the deletion of test users, you can view the remaining rows
SELECT * FROM ACCOUNT_T;