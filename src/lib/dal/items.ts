import { buildUrl, jsonFetch } from "@/lib/http";
import type {
  Item, Entry, CreateItemInput, CreateEntryInput
} from "@/lib/validation/items";

export type ApiResult<T> = { data: T | null; error: string };
export const hasData = <T,>(r: ApiResult<T>): r is { data: T; error: "" } =>
  r.error === "" && r.data !== null;

export async function checkItemByBarcode(barcode: string): Promise<ApiResult<{ exists: boolean; item: Item | null }>> {
  const url = buildUrl("/api/items/check", { barcode });
  return jsonFetch<{ exists: boolean; item: Item | null }>(url);
}

export async function createItem(payload: CreateItemInput): Promise<ApiResult<Item>> {
  const url = buildUrl("/api/items/create");
  return jsonFetch<Item>(url, { method: "POST", body: JSON.stringify(payload) });
}

export async function createEntry(payload: CreateEntryInput): Promise<ApiResult<Entry>> {
  const url = buildUrl("/api/entries/create");
  return jsonFetch<Entry>(url, { method: "POST", body: JSON.stringify(payload) });
}
