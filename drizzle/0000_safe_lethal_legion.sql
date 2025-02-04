-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "flyway_backend" (
	"installed_rank" integer PRIMARY KEY NOT NULL,
	"version" varchar(50),
	"description" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"script" varchar(1000) NOT NULL,
	"checksum" integer,
	"installed_by" varchar(100) NOT NULL,
	"installed_on" timestamp DEFAULT now() NOT NULL,
	"execution_time" integer NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"include_cil" boolean NOT NULL,
	"include_lie" boolean NOT NULL,
	"fueltype1_id" uuid NOT NULL,
	"fueltype2_id" uuid,
	"created_by" varchar(60) NOT NULL,
	"modified_by" varchar(60) NOT NULL,
	"modified_on" timestamp(3) NOT NULL,
	CONSTRAINT "unit_uc1" UNIQUE("tenant_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fixed_availability" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"fueltype1_fixed_net_cpty" numeric(10, 3),
	"fueltype1_cil" numeric(10, 3),
	"fueltype1_lie" numeric(10, 3),
	"fueltype2_fixed_net_cpty" numeric(10, 3),
	"fueltype2_cil" numeric(10, 3),
	"fueltype2_lie" numeric(10, 3),
	"effective_date" timestamp(3),
	"created_by" varchar(100) NOT NULL,
	"modified_by" varchar(100) NOT NULL,
	"modified_on" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hourly_availability" (
	"id" uuid PRIMARY KEY NOT NULL,
	"unit_id" uuid NOT NULL,
	"fixed_availability_id" uuid NOT NULL,
	"date" date NOT NULL,
	"hour" integer NOT NULL,
	"market_type" varchar(10) NOT NULL,
	"fueltype1_net_cpty" numeric(10, 3) NOT NULL,
	"fueltype1_availability_net_cpty" numeric(10, 3) NOT NULL,
	"fueltype2_net_cpty" numeric(10, 3),
	"fueltype2_availability_net_cpty" numeric(10, 3),
	"operation_type" varchar(100) NOT NULL,
	"status" varchar(100) NOT NULL,
	"status_code" integer NOT NULL,
	"comments" varchar(255),
	"created_by" varchar(100) NOT NULL,
	"modified_by" varchar(100) NOT NULL,
	"modified_on" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fuel_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_by" varchar(100) NOT NULL,
	"modified_by" varchar(100) NOT NULL,
	"modified_on" timestamp(3) NOT NULL,
	CONSTRAINT "fuel_type_uc1" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fixed_availability" ADD CONSTRAINT "fixed_availability_fk1" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hourly_availability" ADD CONSTRAINT "hourly_availability_fk1" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hourly_availability" ADD CONSTRAINT "hourly_availability_fk2" FOREIGN KEY ("fixed_availability_id") REFERENCES "public"."fixed_availability"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flyway_backend_s_idx" ON "flyway_backend" ("success");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "unit_ix1" ON "unit" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fixed_availability_ix1" ON "fixed_availability" ("unit_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hourly_availability_ix1" ON "hourly_availability" ("unit_id","date");
*/