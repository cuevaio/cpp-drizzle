import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

import {
  fixed_availability,
  fuel_type,
  hourly_availability,
  unit,
  users,
} from "./schema";

import { ipp } from "../drizzle/schema";

const queryClient = postgres(
  "postgresql://postgres:postgres@localhost:5432/cpp"
);
console.log("Connection established");

const db = drizzle(queryClient);

try {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  await db.execute(sql`DELETE FROM hourly_availability`);
  await db.execute(sql`DELETE FROM fixed_availability`);
  await db.execute(sql`DELETE FROM unit`);
  await db.execute(sql`DELETE FROM fuel_type`);
  await db.execute(sql`DELETE FROM ipp`);
  await db.execute(sql`DELETE FROM users`);

  console.log("Data deleted successfully");

  const YESTERDAY = sql<Date>`CURRENT_DATE - INTERVAL '1 day'`;
  const TWO_DAYS_AGO = sql<Date>`CURRENT_DATE - INTERVAL '2 days'`;
  const THREE_DAYS_AGO = sql<Date>`CURRENT_DATE - INTERVAL '3 days'`;
  const LAST_WEEK = sql<Date>`CURRENT_DATE - INTERVAL '7 days'`;

  const [windFuelType] = await db
    .insert(fuel_type)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "Wind",
      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  const [solarFuelType] = await db
    .insert(fuel_type)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "Solar",
      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  const [gasFuelType] = await db
    .insert(fuel_type)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "Gas",
      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  console.log("Fuel types created successfully");

  const [ipp1] = await db
    .insert(ipp)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "ipp1",
      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();
  const [ipp2] = await db
    .insert(ipp)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "ipp2",
      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  console.log("IPPs created successfully");

  // create users
  const user_emails_ipp1 = [
    "cpp_approver@test.com",
    "cpp_admin@test.com",
    "cpp_editor@test.com",
    "cpp_viewer@test.com",
  ];
  const user_emails_ipp2 = [
    "cpp2_approver@test.com",
    "cpp2_admin@test.com",
    "cpp2_editor@test.com",
    "cpp2_viewer@test.com",
  ];

  await db.insert(users).values(
    user_emails_ipp1.map((email) => ({
      id: sql`uuid_generate_v4()`,
      email,
      created_by: "System",
      modified_by: "System",
      modified_on: LAST_WEEK,
      created_on: LAST_WEEK,
      ipp_id: ipp1.id,
    }))
  );
  await db.insert(users).values(
    user_emails_ipp2.map((email) => ({
      id: sql`uuid_generate_v4()`,
      email,
      created_by: "System",
      modified_by: "System",
      modified_on: LAST_WEEK,
      created_on: LAST_WEEK,
      ipp_id: ipp2.id,
    }))
  );

  const [gatUnit] = await db
    .insert(unit)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "Gas Unit",

      include_cil: true,
      include_lie: true,
      fueltype1_id: gasFuelType.id,
      fueltype2_id: null,
      ipp_id: ipp1.id,

      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  const [dualFuelUnit] = await db
    .insert(unit)
    .values({
      id: sql`uuid_generate_v4()`,
      name: "Wind and Solar Unit",

      include_cil: true,
      include_lie: true,
      fueltype1_id: windFuelType.id,
      fueltype2_id: solarFuelType.id,
      ipp_id: ipp2.id,

      created_by: "System",
      modified_by: "System",
      modified_on: sql<Date>`CURRENT_DATE`,
    })
    .returning();

  console.log("Units created successfully");

  const [fixedAvailabilityGas] = await db
    .insert(fixed_availability)
    .values({
      id: sql`uuid_generate_v4()`,
      unit_id: gatUnit.id,

      fueltype1_fixed_net_cpty: sql<string>`floor(random() * 501)`,
      fueltype1_cil: sql<string>`floor(random() * 501)`,
      fueltype1_lie: sql<string>`floor(random() * 501)`,

      effective_date: LAST_WEEK,
      created_by: "System",
      modified_by: "System",
      modified_on: LAST_WEEK,
    })
    .returning();

  await db.insert(hourly_availability).values(
    new Array(100).fill(0).map((_, j) => {
      return {
        id: sql`uuid_generate_v4()`,

        unit_id: fixedAvailabilityGas.unit_id,
        fixed_availability_id: fixedAvailabilityGas.id,
        date: THREE_DAYS_AGO,
        hour: j < 25 ? j + 1 : j < 50 ? j - 24 : j < 75 ? j - 49 : j - 74,
        market_type: j < 50 ? (j < 25 ? "MDA" : "MTR") : j < 75 ? "MDA" : "MTR",

        fueltype1_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_availability_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_cil: sql<string>`floor(random() * 501)`,
        fueltype1_lie: sql<string>`floor(random() * 501)`,

        operation_type: sql<string>`(ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)]`,
        status: j < 50 ? "DRAFT" : "PUBLISHED",
        status_code: j < 50 ? 1 : 2,
        comments: sql<string>`(ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)]`,

        created_by: "System",
        modified_by: "System",
        modified_on: THREE_DAYS_AGO,
      };
    })
  );

  await db.insert(hourly_availability).values(
    new Array(50).fill(0).map((_, j) => {
      return {
        id: sql`uuid_generate_v4()`,

        unit_id: fixedAvailabilityGas.unit_id,
        fixed_availability_id: fixedAvailabilityGas.id,
        date: TWO_DAYS_AGO,
        hour: j < 25 ? j + 1 : j - 24,
        market_type: j < 25 ? "MDA" : "MTR",

        fueltype1_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_availability_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_cil: sql<string>`floor(random() * 501)`,
        fueltype1_lie: sql<string>`floor(random() * 501)`,

        operation_type: sql<string>`(ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)]`,
        status: "DRAFT",
        status_code: 1,
        comments: sql<string>`(ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)]`,

        created_by: "System",
        modified_by: "System",
        modified_on: TWO_DAYS_AGO,
      };
    })
  );

  await db.insert(hourly_availability).values(
    new Array(46).fill(0).map((_, j) => {
      return {
        id: sql`uuid_generate_v4()`,

        unit_id: fixedAvailabilityGas.unit_id,
        fixed_availability_id: fixedAvailabilityGas.id,
        date: YESTERDAY,
        hour: j < 23 ? j + 1 : j - 22,
        market_type: j < 23 ? "MDA" : "MTR",

        fueltype1_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_availability_net_cpty: sql<string>`floor(random() * 501)`,
        fueltype1_cil: sql<string>`floor(random() * 501)`,
        fueltype1_lie: sql<string>`floor(random() * 501)`,

        operation_type: sql<string>`(ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)]`,
        status: "DRAFT",
        status_code: 1,
        comments: sql<string>`(ARRAY['Comment 1', 'Comment 2', 'Comment 3'])[floor(random() * 3 + 1)]`,

        created_by: "System",
        modified_by: "System",
        modified_on: YESTERDAY,
      };
    })
  );

  console.log("Data created successfully");

  queryClient
    .end()
    .then(() => console.log("Connection closed"))
    .catch(console.error)
    .finally(() => process.exit(0));
} catch (error) {
  console.error(error);
  queryClient
    .end()
    .then(() => console.log("Connection closed"))
    .catch(console.error)
    .finally(() => process.exit(0));
}
