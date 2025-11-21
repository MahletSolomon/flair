// Tiny fetch/URL helpers shared by all API clients

export const isServer = typeof window === "undefined";

// Prefer NEXT_PUBLIC_APP_URL in all envs you need absolute URLs (SSR, scripts)
// Fallbacks keep local dev working.
export const BASE_URL =
  (isServer
    ? process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL
    : process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";

/**
 * Build a URL string for our API.
 * - On the server, returns absolute like "http://localhost:3000/api/xxx"
 * - On the client, returns a relative like "/api/xxx?..."
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (!path.startsWith("/")) path = `/${path}`;

  const qp = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qp.set(k, String(v));
    }
  }

  if (isServer) {
    const url = new URL(path, BASE_URL);
    if ([...qp.keys()].length) url.search = qp.toString();
    return url.toString();
  }

  // client: return relative path (safe for fetch in browser)
  const qs = qp.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Fetch JSON and normalize { data, error } shape */
export async function jsonFetch<T>(
  input: string,
  init?: RequestInit
): Promise<{ data: T | null; error: string }> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const body = await res
    .json()
    .catch(() => ({ data: null, error: "Invalid JSON response" }));

  if (!res.ok) {
    const err =
      body?.error ||
      body?.message ||
      (Array.isArray(body) ? JSON.stringify(body) : "Request failed");
    return { data: null, error: err };
  }

  // API returns {data: ...}
  return { data: (body?.data ?? null) as T | null, error: "" };
}
