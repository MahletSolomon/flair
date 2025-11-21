import type {
  Item,
  Entry,
  ScanItemInput,
  CreateEntryInput,
} from "@/lib/validation/items";

type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    const body = await res.json();

    if (!res.ok) {
      const msg =
        body?.error
          ? typeof body.error === "string"
            ? body.error
            : "Validation error"
          : "Request failed";
      return { data: null, error: msg };
    }

    return { data: body.data ?? body, error: null };
  } catch (e: any) {
    return { data: null, error: e?.message || "Network error" };
  }
}

// ---- Items ----

export async function getAllItems(): Promise<ApiResult<Item[]>> {
  return apiFetch<Item[]>("/api/items");
}

export async function checkItemByBarcode(
  barcode: string,
): Promise<ApiResult<{ exists: boolean; item: Item | null }>> {
  const url = `/api/items/check?barcode=${encodeURIComponent(barcode)}`;
  return apiFetch<{ exists: boolean; item: Item | null }>(url);
}

export async function scanOrCreateItem(
  payload: ScanItemInput,
): Promise<ApiResult<Item>> {
  return apiFetch<Item>("/api/items/scan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---- Entries ----

export async function createEntry(
  payload: CreateEntryInput,
): Promise<ApiResult<{ entry: Entry }>> {
  return apiFetch<{ entry: Entry }>("/api/entries/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function hasData<T>(
  res: ApiResult<T>,
): res is { data: T; error: null } {
  return res.error === null && res.data !== null;
}
