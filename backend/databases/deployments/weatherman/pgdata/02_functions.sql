-- Insert an application admin user into the "user" table (idempotent)
-- This creates an application-level user row (not a database ROLE).
-- Email: admin@email.com
-- Password: passowrd

DO $$
BEGIN
   -- Only run if the table exists
   IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user') THEN
      -- If no user with this email exists, insert one with a fixed UUID
      IF NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'admin@email.com') THEN
         INSERT INTO "user" ("id", "email", "name", "password", "createdAt")
         VALUES ('00000000-0000-4000-8000-000000000001', 'admin@email.com', 'admin', 'passowrd', CURRENT_TIMESTAMP);
      ELSE
         -- If the user already exists, ensure the password is set to the requested value
         UPDATE "user" SET password = 'passowrd' WHERE email = 'admin@email.com';
      END IF;
   END IF;
END
$$;

-- End of admin user insertion

-- Placeholder functions for weatherman DB
