-- CreateAdminUser
INSERT INTO "User" (id, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@trackhabit.test',
  '$2b$12$WYXu7Pj8hdU9/bPGajKLnOhSeHyDPkuuxwX4od.QFvuPoyouUn0Bi',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
