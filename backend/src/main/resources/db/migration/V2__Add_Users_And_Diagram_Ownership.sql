CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Add user_id column to diagrams table
ALTER TABLE diagrams ADD COLUMN user_id BIGINT;

-- Add foreign key constraint
ALTER TABLE diagrams ADD CONSTRAINT fk_diagrams_user FOREIGN KEY (user_id) REFERENCES users(id);
