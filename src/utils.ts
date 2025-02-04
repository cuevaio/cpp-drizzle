import { sql } from "drizzle-orm";

export function getRandomMarketType() {
  const marketTypes = ["MDA", "MTR"];
  return marketTypes[getRandomInt(0, marketTypes.length - 1)];
}

export function getRandomOperationType() {
  return sql<string>`(ARRAY['Disponible a Despacho', 'Operación Obligada', 'Operación No Disponible'])[floor(random() * 3 + 1)]`;
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomBool() {
  return Math.random() > 0.5;
}

export function getRandomDate() {
  const start = new Date(2024, 3, 0);
  const end = new Date();
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}
