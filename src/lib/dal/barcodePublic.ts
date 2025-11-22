export type PublicLookup = {
  name: string | null;
  source: "openfoodfacts" | "upcitemdb";
};

// Try Open Food Facts, then UPCItemDB (optional)
export async function lookupBarcodePublic(barcode: string): Promise<PublicLookup> {
  // 1) Open Food Facts (no key)
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { cache: "no-store" }
    );
    if (r.ok) {
      const j = await r.json();
      if (j?.product?.product_name) {
        return { name: j.product.product_name as string, source: "openfoodfacts" };
      }
    }
  } catch { /* ignore */ }

  // 2) UPCItemDB trial (100/day, no key)
  try {
    const r2 = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { cache: "no-store" }
    );
    if (r2.ok) {
      const j2 = await r2.json();
      const title = j2?.items?.[0]?.title as string | undefined;
      if (title && title.trim()) {
        return { name: title, source: "upcitemdb" };
      }
    }
  } catch { /* ignore */ }

  return { name: null, source: "openfoodfacts" };
}
