import {
  pgTable,
  index,
  integer,
  varchar,
  timestamp,
  boolean,
  foreignKey,
  uuid,
  numeric,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const flyway_backend = pgTable(
  "flyway_backend",
  {
    installed_rank: integer("installed_rank").primaryKey().notNull(),
    version: varchar("version", { length: 50 }),
    description: varchar("description", { length: 200 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    script: varchar("script", { length: 1000 }).notNull(),
    checksum: integer("checksum"),
    installed_by: varchar("installed_by", { length: 100 }).notNull(),
    installed_on: timestamp("installed_on", { mode: "string" })
      .defaultNow()
      .notNull(),
    execution_time: integer("execution_time").notNull(),
    success: boolean("success").notNull(),
  },
  (table) => {
    return {
      s_idx: index("flyway_backend_s_idx").on(table.success),
    };
  }
);

export const fixed_availability = pgTable(
  "fixed_availability",
  {
    id: uuid("id").primaryKey().notNull(),
    unit_id: uuid("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    fueltype1_fixed_net_cpty: numeric("fueltype1_fixed_net_cpty", {
      precision: 10,
      scale: 3,
    }),
    fueltype1_cil: numeric("fueltype1_cil", { precision: 10, scale: 3 }),
    fueltype1_lie: numeric("fueltype1_lie", { precision: 10, scale: 3 }),
    fueltype2_fixed_net_cpty: numeric("fueltype2_fixed_net_cpty", {
      precision: 10,
      scale: 3,
    }),
    fueltype2_cil: numeric("fueltype2_cil", { precision: 10, scale: 3 }),
    fueltype2_lie: numeric("fueltype2_lie", { precision: 10, scale: 3 }),
    created_by: varchar("created_by", { length: 100 }).notNull(),
    modified_by: varchar("modified_by", { length: 100 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    effective_date: date("effective_date"),
  },
  (table) => {
    return {
      ix1: index("fixed_availability_ix1").on(table.unit_id),
    };
  }
);

export const fuel_type = pgTable(
  "fuel_type",
  {
    id: uuid("id").primaryKey().notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    created_by: varchar("created_by", { length: 100 }).notNull(),
    modified_by: varchar("modified_by", { length: 100 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
  },
  (table) => {
    return {
      fuel_type_uc1: unique("fuel_type_uc1").on(table.name),
    };
  }
);

export const ipp = pgTable(
  "ipp",
  {
    id: uuid("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    created_by: varchar("created_by", { length: 60 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    modified_by: varchar("modified_by", { length: 60 }).notNull(),
  },
  (table) => {
    return {
      ix1: index("ipp_ix1").on(table.name),
      ipp_uc1: unique("ipp_uc1").on(table.name),
    };
  }
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull(),
    ipp_id: uuid("ipp_id").references(() => ipp.id, { onDelete: "set null" }),
    email: varchar("email", { length: 255 }).notNull(),
    created_on: timestamp("created_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    created_by: varchar("created_by", { length: 60 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    modified_by: varchar("modified_by", { length: 60 }).notNull(),
  },
  (table) => {
    return {
      ix1: index("users_ix1").on(table.ipp_id),
      users_uc1: unique("users_uc1").on(table.email),
    };
  }
);

export const hourly_availability = pgTable(
  "hourly_availability",
  {
    id: uuid("id").primaryKey().notNull(),
    unit_id: uuid("unit_id")
      .notNull()
      .references(() => unit.id, { onDelete: "cascade" }),
    fixed_availability_id: uuid("fixed_availability_id")
      .notNull()
      .references(() => fixed_availability.id),
    date: date("date").notNull(),
    hour: integer("hour").notNull(),
    market_type: varchar("market_type", { length: 10 }).notNull(),
    fueltype1_net_cpty: numeric("fueltype1_net_cpty", {
      precision: 10,
      scale: 3,
    }).notNull(),
    fueltype1_availability_net_cpty: numeric(
      "fueltype1_availability_net_cpty",
      { precision: 10, scale: 3 }
    ).notNull(),
    fueltype2_net_cpty: numeric("fueltype2_net_cpty", {
      precision: 10,
      scale: 3,
    }),
    fueltype2_availability_net_cpty: numeric(
      "fueltype2_availability_net_cpty",
      { precision: 10, scale: 3 }
    ),
    operation_type: varchar("operation_type", { length: 100 }).notNull(),
    status: varchar("status", { length: 100 }).notNull(),
    status_code: integer("status_code").notNull(),
    comments: varchar("comments", { length: 255 }),
    created_by: varchar("created_by", { length: 100 }).notNull(),
    modified_by: varchar("modified_by", { length: 100 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    fueltype1_cil: numeric("fueltype1_cil", { precision: 10, scale: 3 }),
    fueltype1_lie: numeric("fueltype1_lie", { precision: 10, scale: 3 }),
    fueltype2_cil: numeric("fueltype2_cil", { precision: 10, scale: 3 }),
    fueltype2_lie: numeric("fueltype2_lie", { precision: 10, scale: 3 }),
  },
  (table) => {
    return {
      ix1: index("hourly_availability_ix1").on(table.unit_id, table.date),
      ix2: index("hourly_availability_ix2").on(
        table.date,
        table.hour,
        table.market_type
      ),
      ix3: index("hourly_availability_ix3").on(
        table.unit_id,
        table.fixed_availability_id,
        table.date,
        table.status_code
      ),
    };
  }
);

export const unit = pgTable(
  "unit",
  {
    id: uuid("id").primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    include_cil: boolean("include_cil").notNull(),
    include_lie: boolean("include_lie").notNull(),
    fueltype1_id: uuid("fueltype1_id")
      .notNull()
      .references(() => fuel_type.id),
    fueltype2_id: uuid("fueltype2_id").references(() => fuel_type.id),
    created_by: varchar("created_by", { length: 60 }).notNull(),
    modified_by: varchar("modified_by", { length: 60 }).notNull(),
    modified_on: timestamp("modified_on", {
      precision: 3,
      mode: "string",
    }).notNull(),
    timezone: varchar("timezone", { length: 50 })
      .default("America/Mexico_City")
      .notNull(),
    ipp_id: uuid("ipp_id").references(() => ipp.id, { onDelete: "set null" }),
  },
  (table) => {
    return {
      ix1: index("unit_ix1").on(table.ipp_id),
      ix2: index("unit_ix2").on(table.name),
      unit_uc1: unique("unit_uc1").on(table.name, table.ipp_id),
    };
  }
);
