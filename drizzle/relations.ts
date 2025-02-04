import { relations } from "drizzle-orm/relations";
import { unit, fixed_availability, ipp, users, hourly_availability, fuel_type } from "./schema";

export const fixed_availabilityRelations = relations(fixed_availability, ({one, many}) => ({
	unit: one(unit, {
		fields: [fixed_availability.unit_id],
		references: [unit.id]
	}),
	hourly_availabilities: many(hourly_availability),
}));

export const unitRelations = relations(unit, ({one, many}) => ({
	fixed_availabilities: many(fixed_availability),
	hourly_availabilities: many(hourly_availability),
	fuel_type_fueltype1_id: one(fuel_type, {
		fields: [unit.fueltype1_id],
		references: [fuel_type.id],
		relationName: "unit_fueltype1_id_fuel_type_id"
	}),
	fuel_type_fueltype2_id: one(fuel_type, {
		fields: [unit.fueltype2_id],
		references: [fuel_type.id],
		relationName: "unit_fueltype2_id_fuel_type_id"
	}),
	ipp: one(ipp, {
		fields: [unit.ipp_id],
		references: [ipp.id]
	}),
}));

export const usersRelations = relations(users, ({one}) => ({
	ipp: one(ipp, {
		fields: [users.ipp_id],
		references: [ipp.id]
	}),
}));

export const ippRelations = relations(ipp, ({many}) => ({
	users: many(users),
	units: many(unit),
}));

export const hourly_availabilityRelations = relations(hourly_availability, ({one}) => ({
	unit: one(unit, {
		fields: [hourly_availability.unit_id],
		references: [unit.id]
	}),
	fixed_availability: one(fixed_availability, {
		fields: [hourly_availability.fixed_availability_id],
		references: [fixed_availability.id]
	}),
}));

export const fuel_typeRelations = relations(fuel_type, ({many}) => ({
	units_fueltype1_id: many(unit, {
		relationName: "unit_fueltype1_id_fuel_type_id"
	}),
	units_fueltype2_id: many(unit, {
		relationName: "unit_fueltype2_id_fuel_type_id"
	}),
}));