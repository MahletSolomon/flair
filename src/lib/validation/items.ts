import { z } from "zod";

export const checkBarcodeSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
});

export const scanItemSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  languageCode: z.string().optional(),
});

export const createEntrySchema = z.object({
  itemId: z.number().int().positive(),
  size: z.string().optional(),
  quantity: z
    .number({
      error: "Quantity must be a number",
    })
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
});

// ----- Types -----
export type CheckBarcodeInput = z.infer<typeof checkBarcodeSchema>;
export type ScanItemInput = z.infer<typeof scanItemSchema>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;

// API response shapes
export type Item = {
  id: number;
  barcode: string;
  name: string | null;
  description: string | null;
  languageCode: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Entry = {
  id: number;
  itemId: number;
  size: string | null;
  quantity: number;
  createdAt: string | Date;
};
