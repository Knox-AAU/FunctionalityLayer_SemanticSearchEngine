-- Create a table
CREATE TABLE IF NOT EXISTS pdfTable (
    title VARCHAR(1023),
    url VARCHAR(1023) UNIQUE,
    pdfPath VARCHAR(1023),
    stringPath VARCHAR(1023),
    author VARCHAR(255),
    timestamp bigint
);

CREATE TABLE IF NOT EXISTS spoTable (
    S VARCHAR(184),
    P VARCHAR(34),
    O VARCHAR(2143)
);


-- Create a user
CREATE USER defaultuser WITH PASSWORD '1234';

-- Grant insert and select permissions on the table to the user
GRANT INSERT, SELECT ON pdfTable TO defaultuser;
GRANT INSERT, SELECT ON spoTable TO defaultuser;

\copy spoTable FROM '/docker-entrypoint-initdb.d/localTempDB.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');
