import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(
  "postgresql://postgres:postgres@localhost:5432/cpp"
);
const db = drizzle(queryClient);
import { sql } from "drizzle-orm";

const SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing data
DELETE FROM hourly_availability;
DELETE FROM fixed_availability;
DELETE FROM unit;
DELETE FROM fuel_type;
DELETE FROM ipp;
DELETE FROM users;

-- Insert Fuel Types
INSERT INTO fuel_type (id, name, created_by, modified_by, modified_on)
VALUES 
  (uuid_generate_v4(), 'Wind', 'System', 'System', CURRENT_DATE),
  (uuid_generate_v4(), 'Solar', 'System', 'System', CURRENT_DATE),
  (uuid_generate_v4(), 'Gas', 'System', 'System', CURRENT_DATE)
RETURNING *;

-- Insert IPPs
INSERT INTO ipp (id, name, created_by, modified_by, modified_on)
VALUES 
  (uuid_generate_v4(), 'ipp1', 'System', 'System', CURRENT_DATE),
  (uuid_generate_v4(), 'ipp2', 'System', 'System', CURRENT_DATE)
RETURNING *;

-- Insert Users
INSERT INTO users (id, email, created_by, modified_by, modified_on, created_on, ipp_id)
SELECT 
  uuid_generate_v4(),
  email,
  'System',
  'System',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE - INTERVAL '7 days',
  (SELECT id FROM ipp WHERE name = 'ipp1')
FROM unnest(ARRAY[
  'cpp_approver@test.com',
  'cpp_admin@test.com',
  'cpp_editor@test.com',
  'cpp_viewer@test.com'
]) AS email;

INSERT INTO users (id, email, created_by, modified_by, modified_on, created_on, ipp_id)
SELECT 
  uuid_generate_v4(),
  email,
  'System',
  'System',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE - INTERVAL '7 days',
  (SELECT id FROM ipp WHERE name = 'ipp2')
FROM unnest(ARRAY[
  'cpp2_approver@test.com',
  'cpp2_admin@test.com',
  'cpp2_editor@test.com',
  'cpp2_viewer@test.com'
]) AS email;

-- Insert Units
INSERT INTO unit (
  id, name, include_cil, include_lie, 
  fueltype1_id, fueltype2_id, ipp_id,
  created_by, modified_by, modified_on
)
VALUES (
  uuid_generate_v4(),
  'Gas Unit',
  true,
  true,
  (SELECT id FROM fuel_type WHERE name = 'Gas'),
  NULL,
  (SELECT id FROM ipp WHERE name = 'ipp1'),
  'System',
  'System',
  CURRENT_DATE
),
(
  uuid_generate_v4(),
  'Wind and Solar Unit',
  true,
  true,
  (SELECT id FROM fuel_type WHERE name = 'Wind'),
  (SELECT id FROM fuel_type WHERE name = 'Solar'),
  (SELECT id FROM ipp WHERE name = 'ipp2'),
  'System',
  'System',
  CURRENT_DATE
)
RETURNING *;

-- Insert Fixed Availability
INSERT INTO fixed_availability (
  id, unit_id,
  fueltype1_fixed_net_cpty, fueltype1_cil, fueltype1_lie,
  effective_date, created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  (SELECT id FROM unit WHERE name = 'Gas Unit'),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  CURRENT_DATE - INTERVAL '7 days',
  'System',
  'System',
  CURRENT_DATE - INTERVAL '7 days'
RETURNING *;

-- Insert Hourly Availability (3 days ago - 100 records)
INSERT INTO hourly_availability (
  id, unit_id, fixed_availability_id, date, hour, market_type,
  fueltype1_net_cpty, fueltype1_availability_net_cpty,
  fueltype1_cil, fueltype1_lie,
  operation_type, status, status_code, comments,
  created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  (SELECT id FROM unit WHERE name = 'Gas Unit'),
  (SELECT id FROM fixed_availability LIMIT 1),
  CURRENT_DATE - INTERVAL '3 days',
  CASE 
    WHEN generate_series < 25 THEN generate_series + 1
    WHEN generate_series < 50 THEN generate_series - 24
    WHEN generate_series < 75 THEN generate_series - 49
    ELSE generate_series - 74
  END,
  CASE 
    WHEN generate_series < 50 THEN 
      CASE WHEN generate_series < 25 THEN 'MDA' ELSE 'MTR' END
    ELSE 
      CASE WHEN generate_series < 75 THEN 'MDA' ELSE 'MTR' END
  END,
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
  CASE WHEN generate_series < 50 THEN 'DRAFT' ELSE 'PUBLISHED' END,
  CASE WHEN generate_series < 50 THEN 1 ELSE 2 END,
  (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
  'System',
  'System',
  CURRENT_DATE - INTERVAL '3 days'
FROM generate_series(0, 99) AS generate_series;

-- Similar INSERT statements for 2 days ago (50 records) and yesterday (46 records)
-- would follow the same pattern with adjusted dates and record counts
`;

await db.execute(sql<string>`${SQL}`);
