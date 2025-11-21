import { buildUrl, jsonFetch } from "@/lib/http";
import type { Item, Entry, CreateEntryInput } from "@/lib/validation/items";

export type ApiResult<T> = { data: T | null; error: string }; // error === "" means success
export const hasData = <T,>(r: ApiResult<T>): r is { data: T; error: "" } =>
  r.error === "" && r.data !== null;

// ---- Items ----

export async function getAllItems(): Promise<ApiResult<Item[]>> {
  const url = buildUrl("/api/items");
  return jsonFetch<Item[]>(url);
}

export async function checkItemByBarcode(
  barcode: string
): Promise<ApiResult<{ exists: boolean; item: Item | null }>> {
  const url = buildUrl("/api/items/check", { barcode });
  return jsonFetch<{ exists: boolean; item: Item | null }>(url);
}

export async function createItem(
  payload: { barcode: string; name: string }
): Promise<ApiResult<Item>> {
  const url = buildUrl("/api/items/create");
  return jsonFetch<Item>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Entries ----

export async function createEntry(
  payload: CreateEntryInput
): Promise<ApiResult<Entry>> {
  const url = buildUrl("/api/entries/create");
  return jsonFetch<Entry>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
