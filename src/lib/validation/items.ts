import { z } from "zod";

// ✅ Only what we need now
export const checkBarcodeSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
});

export const createItemSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  name: z.string().min(1, "Name is required"),
});

export const createEntrySchema = z.object({
  itemId: z.number().int().positive(),
  size: z.string().min(1, "").optional(),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
  buyingPrice: z.number().positive("Buying price required"),   // ⬅ new
  sellingPrice: z.number().positive("Selling price required"),
});

// Types
export type CheckBarcodeInput = z.infer<typeof checkBarcodeSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

export type Item = {
  id: number;
  barcode: string;
  name: string;
  createdAt: string | Date;
};

export type Entry = {
  id: number;
  itemId: number;
  size?: string | null;     // ⬅ optional
  quantity: number;
  buyingPrice: number;      // ⬅ new
  sellingPrice: number;     // ⬅ new
  createdAt: string | Date;
};

