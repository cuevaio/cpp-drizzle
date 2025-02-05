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
  (uuid_generate_v4(), 'Gas', 'System', 'System', CURRENT_DATE);

-- Insert IPPs
INSERT INTO ipp (id, name, created_by, modified_by, modified_on)
VALUES 
  (uuid_generate_v4(), 'ipp1', 'System', 'System', CURRENT_DATE),
  (uuid_generate_v4(), 'ipp2', 'System', 'System', CURRENT_DATE);

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
);

-- Insert Fixed Availability for Gas Unit
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
  CURRENT_DATE - INTERVAL '7 days';

-- Insert Hourly Availability (3 days ago - first create DRAFT records, then duplicate as PUBLISHED)
WITH draft_records AS (
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
    (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Gas Unit') LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days',
    CASE 
      WHEN generate_series < 24 THEN generate_series + 1
      ELSE generate_series - 23
    END,
    CASE 
      WHEN generate_series < 24 THEN 'MDA'
      ELSE 'MTR'
    END,
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
    'DRAFT',
    1,
    (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
    'System',
    'System',
    CURRENT_DATE - INTERVAL '3 days'
  FROM generate_series(0, 47) AS generate_series
  RETURNING *
)
INSERT INTO hourly_availability (
  id, unit_id, fixed_availability_id, date, hour, market_type,
  fueltype1_net_cpty, fueltype1_availability_net_cpty,
  fueltype1_cil, fueltype1_lie,
  operation_type, status, status_code, comments,
  created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  unit_id,
  fixed_availability_id,
  date,
  hour,
  market_type,
  fueltype1_net_cpty,
  fueltype1_availability_net_cpty,
  fueltype1_cil,
  fueltype1_lie,
  operation_type,
  'PUBLISHED',  -- Change status to PUBLISHED
  2,           -- Change status_code to 2
  comments,
  created_by,
  modified_by,
  modified_on
FROM draft_records;

-- Insert Hourly Availability (2 days ago - 48 records) for Gas Unit
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
  (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Gas Unit') LIMIT 1),
  CURRENT_DATE - INTERVAL '2 days',
  CASE 
    WHEN generate_series < 24 THEN generate_series + 1
    ELSE generate_series - 23
  END,
  CASE 
    WHEN generate_series < 24 THEN 'MDA'
    ELSE 'MTR'
  END,
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
  'DRAFT',
  1,
  (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
  'System',
  'System',
  CURRENT_DATE - INTERVAL '2 days'
FROM generate_series(0, 47) AS generate_series;

-- Insert Hourly Availability (yesterday - 46 records) for Gas Unit
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
  (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Gas Unit') LIMIT 1),
  CURRENT_DATE - INTERVAL '1 day',
  CASE 
    WHEN generate_series < 23 THEN generate_series + 1
    ELSE generate_series - 22
  END,
  CASE 
    WHEN generate_series < 23 THEN 'MDA'
    ELSE 'MTR'
  END,
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
  'DRAFT',
  1,
  (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
  'System',
  'System',
  CURRENT_DATE - INTERVAL '1 day'
FROM generate_series(0, 45) AS generate_series;


-- Insert Fixed Availability for Wind and Solar Unit
INSERT INTO fixed_availability (
  id, unit_id,
  fueltype1_fixed_net_cpty, fueltype1_cil, fueltype1_lie,
  fueltype2_fixed_net_cpty, fueltype2_cil, fueltype2_lie,
  effective_date, created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  (SELECT id FROM unit WHERE name = 'Wind and Solar Unit'),
  floor(random() * 501),
  floor(random() * 501), 
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  CURRENT_DATE - INTERVAL '7 days',
  'System',
  'System',
  CURRENT_DATE - INTERVAL '7 days';


-- Insert Hourly Availability (3 days ago - first create DRAFT records, then duplicate as PUBLISHED)
WITH draft_records AS (
  INSERT INTO hourly_availability (
    id, unit_id, fixed_availability_id, date, hour, market_type,
    fueltype1_net_cpty, fueltype1_availability_net_cpty,
    fueltype1_cil, fueltype1_lie,
    fueltype2_net_cpty, fueltype2_availability_net_cpty,
    fueltype2_cil, fueltype2_lie,
    operation_type, status, status_code, comments,
    created_by, modified_by, modified_on
  )
  SELECT
    uuid_generate_v4(),
    (SELECT id FROM unit WHERE name = 'Wind and Solar Unit'),
    (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Wind and Solar Unit') LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days',
    CASE 
      WHEN generate_series < 24 THEN generate_series + 1
      ELSE generate_series - 23
    END,
    CASE 
      WHEN generate_series < 24 THEN 'MDA'
      ELSE 'MTR'
    END,
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    floor(random() * 501),
    (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
    'DRAFT',
    1,
    (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
    'System',
    'System',
    CURRENT_DATE - INTERVAL '3 days'
  FROM generate_series(0, 47) AS generate_series
  RETURNING *
)
INSERT INTO hourly_availability (
    id, unit_id, fixed_availability_id, date, hour, market_type,
    fueltype1_net_cpty, fueltype1_availability_net_cpty,
    fueltype1_cil, fueltype1_lie,
    fueltype2_net_cpty, fueltype2_availability_net_cpty,
    fueltype2_cil, fueltype2_lie,
    operation_type, status, status_code, comments,
    created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  unit_id,
  fixed_availability_id,
  date,
  hour,
  market_type,
  fueltype1_net_cpty,
  fueltype1_availability_net_cpty,
  fueltype1_cil,
  fueltype1_lie,
  fueltype2_net_cpty,
  fueltype2_availability_net_cpty,
  fueltype2_cil,
  fueltype2_lie,
  operation_type,
  'PUBLISHED',  -- Change status to PUBLISHED
  2,           -- Change status_code to 2
  comments,
  created_by,
  modified_by,
  modified_on
FROM draft_records;

-- Insert Hourly Availability (2 days ago - 48 records) for Wind and Solar Unit
INSERT INTO hourly_availability (
  id, unit_id, fixed_availability_id, date, hour, market_type,
  fueltype1_net_cpty, fueltype1_availability_net_cpty,
  fueltype1_cil, fueltype1_lie,
  fueltype2_net_cpty, fueltype2_availability_net_cpty,
  fueltype2_cil, fueltype2_lie,
  operation_type, status, status_code, comments,
  created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  (SELECT id FROM unit WHERE name = 'Wind and Solar Unit'),
  (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Wind and Solar Unit') LIMIT 1),
  CURRENT_DATE - INTERVAL '2 days',
  CASE 
    WHEN generate_series < 24 THEN generate_series + 1
    ELSE generate_series - 23
  END,
  CASE 
    WHEN generate_series < 24 THEN 'MDA'
    ELSE 'MTR'
  END,
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
  'DRAFT',
  1,
  (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
  'System',
  'System',
  CURRENT_DATE - INTERVAL '2 days'
FROM generate_series(0, 47) AS generate_series;

-- Insert Hourly Availability (yesterday - 46 records) for Wind and Solar Unit
INSERT INTO hourly_availability (
  id, unit_id, fixed_availability_id, date, hour, market_type,
  fueltype1_net_cpty, fueltype1_availability_net_cpty,
  fueltype1_cil, fueltype1_lie,
  fueltype2_net_cpty, fueltype2_availability_net_cpty,
  fueltype2_cil, fueltype2_lie,
  operation_type, status, status_code, comments,
  created_by, modified_by, modified_on
)
SELECT
  uuid_generate_v4(),
  (SELECT id FROM unit WHERE name = 'Wind and Solar Unit'),
  (SELECT id FROM fixed_availability WHERE unit_id = (SELECT id FROM unit WHERE name = 'Wind and Solar Unit') LIMIT 1),
  CURRENT_DATE - INTERVAL '1 day',
  CASE 
    WHEN generate_series < 23 THEN generate_series + 1
    ELSE generate_series - 22
  END,
  CASE 
    WHEN generate_series < 23 THEN 'MDA'
    ELSE 'MTR'
  END,
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  floor(random() * 501),
  (ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)],
  'DRAFT',
  1,
  (ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)],
  'System',
  'System',
  CURRENT_DATE - INTERVAL '1 day'
FROM generate_series(0, 45) AS generate_series;
