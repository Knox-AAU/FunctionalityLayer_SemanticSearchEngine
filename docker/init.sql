-- Create a table
CREATE TABLE IF NOT EXISTS pdfTable (
    title VARCHAR(1023),
    url VARCHAR(1023) UNIQUE,
    pdfPath VARCHAR(1023),
    author VARCHAR(255),
    timestamp bigint
);

<<<<<<< HEAD
CREATE TABLE IF NOT EXISTS spoTable (
    S VARCHAR(184),
    P VARCHAR(34),
    O VARCHAR(2143)
);

\copy spoTable FROM '/docker-entrypoint-initdb.d/localTempDB.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');


=======
>>>>>>> 0ea5ad0edd12a0336b6d2af2011e1f0af26f06ef
-- Create a user
CREATE USER defaultuser WITH PASSWORD '1234';

-- Grant insert and select permissions on the table to the user
GRANT INSERT, SELECT ON pdfTable TO defaultuser;