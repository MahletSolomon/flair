"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkItemByBarcode, createItem, createEntry } from "@/lib/dal/items";
import { createItemSchema, createEntrySchema } from "@/lib/validation/items";
import { CameraBarcodeScanner } from "./CamerBarcodeScanner";
import { lookupBarcodePublic } from "@/lib/dal/barcodePublic";

export function BarcodeScannerForm() {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");

  const [itemId, setItemId] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // public lookup state
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);

  async function handleLookup(code: string) {
    if (!code) return;

    setChecking(true);
    setError(null);
    setSuccessMsg(null);
    setLookupMsg(null);
    setFieldErrors({});

    const res = await checkItemByBarcode(code);
    if (res.error) {
      setError(res.error);
      setChecking(false);
      return;
    }

    const exists = res.data!.exists;
    const item = res.data!.item;

    if (exists && item) {
      // Existing item → lock name to DB value (read-only via disabled)
      setItemId(item.id);
      setName(item.name ?? "");
      setLookupMsg(null);
    } else {
      // New item → clear id, allow editing, and auto-lookup
      setItemId(null);

      // Only auto-fill if the user hasn't typed anything yet
      if (!name.trim()) {
        setLookupBusy(true);
        try {
          const r = await lookupBarcodePublic(code);
          if (r.name) {
            setName(r.name);
            setLookupMsg(`Filled from ${r.source}. You can edit it.`);
          } else {
            setLookupMsg("Not found on public sources. Please enter a name.");
          }
        } finally {
          setLookupBusy(false);
        }
      } else {
        // user already typed a name—don’t overwrite it
        setLookupMsg("Using your typed name (public sources not applied).");
      }
    }

    setChecking(false);
  }

  function handleBarcodeChange(v: string) {
    setBarcode(v);
    // debounce if you like; for now we trigger immediately when non-empty
    if (v.trim()) void handleLookup(v.trim());
    else {
      setItemId(null);
      setName("");
      setLookupMsg(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMsg(null);

    try {
      // Ensure itemId
      let id = itemId;
      if (!id) {
        // Validate minimal item
        const parsedItem = createItemSchema.safeParse({ barcode, name });
        if (!parsedItem.success) {
          const fe: Record<string, string> = {};
          for (const [k, v] of Object.entries(
            parsedItem.error.flatten().fieldErrors
          )) {
            if (v && v[0]) fe[k] = v[0];
          }
          setFieldErrors(fe);
          throw new Error("Please fix item fields.");
        }

        const cr = await createItem(parsedItem.data);
        if (cr.error || !cr.data)
          throw new Error(cr.error || "Failed to create item");
        id = cr.data.id;
        setItemId(id);
      }

      // Validate entry
      const parsedEntry = createEntrySchema.safeParse({
        itemId: id,
        size,
        quantity: Number(quantity),
      });
      if (!parsedEntry.success) {
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries(
          parsedEntry.error.flatten().fieldErrors
        )) {
          if (v && v[0]) fe[k] = v[0];
        }
        setFieldErrors((prev) => ({ ...prev, ...fe }));
        throw new Error("Please fix entry fields.");
      }

      const er = await createEntry(parsedEntry.data);
      if (er.error || !er.data)
        throw new Error(er.error || "Failed to create entry");

      setSuccessMsg(`Saved entry #${er.data.id} for item #${er.data.itemId}.`);
      setSize("");
      setQuantity("");
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function onDetected(scanned: string) {
    handleBarcodeChange(scanned);
    setShowScanner(false);
  }

  return (
    <>
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-lg md:text-xl">
            <span>Scan / Enter Item</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
            >
              Open camera
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Barcode */}
            <div className="grid gap-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={barcode}
                onChange={(e) => handleBarcodeChange(e.target.value)}
                placeholder="Scan or type barcode"
                required
              />
              <p className="text-xs text-slate-500 min-h-[1rem]">
                {checking
                  ? "Checking…"
                  : itemId
                  ? "Existing item"
                  : barcode
                  ? lookupBusy
                    ? "Looking up name from public sources…"
                    : lookupMsg || "New item"
                  : ""}
              </p>
            </div>

            {/* Name (read-only if existing; editable if new or auto-filled) */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                disabled={!!itemId} // disable only when item exists in DB
                required
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>

            {/* Entry fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 500ml / M / 32oz"
                  required
                />
                {fieldErrors.size && (
                  <p className="text-xs text-red-500">{fieldErrors.size}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="How many?"
                  required
                />
                {fieldErrors.quantity && (
                  <p className="text-xs text-red-500">{fieldErrors.quantity}</p>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
            {successMsg && (
              <p className="text-xs text-green-600">{successMsg}</p>
            )}

            <Button className="w-full" disabled={loading || !barcode}>
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showScanner && (
        <CameraBarcodeScanner
          onDetected={onDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
