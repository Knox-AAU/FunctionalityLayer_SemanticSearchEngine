-- Create a table
CREATE TABLE IF NOT EXISTS pdfTable (
    title VARCHAR(1023),
    url VARCHAR(1023) UNIQUE,
    pdfPath VARCHAR(1023),
    author VARCHAR(255),
    timestamp bigint
);

-- Create a user
CREATE USER defaultuser WITH PASSWORD '1234';

-- Grant insert and select permissions on the table to the user
GRANT INSERT, SELECT ON pdfTable TO defaultuser;