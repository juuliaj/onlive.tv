CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Stores user accounts, hashed credentials and access roles
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    --UNIQUE creates an index on email
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    --Default value to 'viewer' and restrict values to the platform roles
    role VARCHAR(30) NOT NULL DEFAULT 'viewer'
        CHECK(role IN ('viewer', 'uploader', 'admin'))
);



