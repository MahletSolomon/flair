import { buildUrl, jsonFetch } from "@/lib/http";
import type {
  Item,
  Entry,
  ScanItemInput,
  CreateEntryInput,
} from "@/lib/validation/items";

export type ApiResult<T> = {
  data: T | null;
  error: string; // "" means no error
};

// ---- Helpers ----

export function hasData<T>(
  res: ApiResult<T>,
): res is { data: T; error: "" } {
  return res.error === "" && res.data !== null;
}

// ---- Items ----

export async function getAllItems(): Promise<ApiResult<Item[]>> {
  const url = buildUrl("/api/items");
  const { data, error } = await jsonFetch<Item[]>(url);
  return { data, error };
}

export async function checkItemByBarcode(
  barcode: string,
): Promise<ApiResult<{ exists: boolean; item: Item | null }>> {
  const url = buildUrl("/api/items/check", { barcode });
  const { data, error } = await jsonFetch<{ exists: boolean; item: Item | null }>(
    url,
  );
  return { data, error };
}

export async function scanOrCreateItem(
  payload: ScanItemInput,
): Promise<ApiResult<Item>> {
  const url = buildUrl("/api/items/scan");
  const { data, error } = await jsonFetch<Item>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { data, error };
}

// ---- Entries ----

export async function createEntry(
  payload: CreateEntryInput,
): Promise<ApiResult<{ entry: Entry }>> {
  const url = buildUrl("/api/items/create");
  const { data, error } = await jsonFetch<{ entry: Entry }>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { data, error };
}
