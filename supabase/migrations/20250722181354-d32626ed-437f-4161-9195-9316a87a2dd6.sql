
-- Ensure employees table has email as unique identifier
ALTER TABLE employees ADD CONSTRAINT employees_email_key UNIQUE (email);

-- Make sure email is required and add index for faster login queries
ALTER TABLE employees ALTER COLUMN email SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
