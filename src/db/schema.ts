import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// Items table: one row per unique barcode
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  barcode: varchar("barcode", { length: 64 }).notNull().unique(),
  name: text("name"),
  description: text("description"),
  languageCode: varchar("language_code", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional: track each time a barcode is scanned
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 50 }),
  quantity: integer("quantity").notNull(),
  buyingPrice: integer("buying_price").notNull(),
  sellingPrice: integer("selling_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

