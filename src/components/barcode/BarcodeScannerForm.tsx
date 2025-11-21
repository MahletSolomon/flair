"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  checkItemByBarcode,
  scanOrCreateItem,
  createEntry,
} from "@/lib/dal/items";
import { scanItemSchema, createEntrySchema } from "@/lib/validation/items";
import { CameraBarcodeScanner } from "./CamerBarcodeScanner";


export function BarcodeScannerForm() {
  const [barcode, setBarcode] = useState("");
  const [itemExists, setItemExists] = useState(false);
  const [checking, setChecking] = useState(false);

  // item fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [languageCode, setLanguageCode] = useState("");

  // entry fields
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showScanner, setShowScanner] = useState(false);

  async function handleCheck(value: string) {
    if (!value) return;

    setChecking(true);
    setGlobalError(null);
    setSuccessMsg(null);

    const res = await checkItemByBarcode(value);
    if (res.error || !res.data) {
      setGlobalError(res.error);
      setChecking(false);
      return;
    }

    if (res.data.exists) {
      setItemExists(true);
      setName(res.data.item?.name ?? "");
      setDescription(res.data.item?.description ?? "");
      setLanguageCode(res.data.item?.languageCode ?? "");
    } else {
      setItemExists(false);
      setName("");
      setDescription("");
      setLanguageCode("");
    }

    setChecking(false);
  }

  function handleBarcodeChange(value: string) {
    setBarcode(value);
    if (value.trim()) {
      void handleCheck(value);
    } else {
      setItemExists(false);
      setName("");
      setDescription("");
      setLanguageCode("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);
    setFieldErrors({});
    setSuccessMsg(null);

    try {
      // 1) Ensure / create item
      let itemId: number;

      if (!itemExists) {
        const itemParse = scanItemSchema.safeParse({
          barcode,
          name,
          description,
          languageCode,
        });

        if (!itemParse.success) {
          const fieldErrs: Record<string, string> = {};
          for (const [field, issues] of Object.entries(
            itemParse.error.flatten().fieldErrors
          )) {
            if (issues && issues[0]) fieldErrs[field] = issues[0];
          }
          setFieldErrors(fieldErrs);
          throw new Error("Please fix item details");
        }

        const res = await scanOrCreateItem(itemParse.data);
        if (res.error || !res.data) {
          throw new Error(res.error || "Failed to create item");
        }
        itemId = res.data.id;
      } else {
        const res = await checkItemByBarcode(barcode);
        if (res.error || !res.data || !res.data.item) {
          throw new Error(res.error || "Item not found, please rescan");
        }
        itemId = res.data.item.id;
      }

      // 2) Validate & create entry
      const entryParse = createEntrySchema.safeParse({
        itemId,
        size: size || undefined,
        quantity: Number(quantity),
      });

      if (!entryParse.success) {
        const fieldErrs: Record<string, string> = {};
        for (const [field, issues] of Object.entries(
          entryParse.error.flatten().fieldErrors
        )) {
          if (issues && issues[0]) fieldErrs[field] = issues[0];
        }
        setFieldErrors((prev) => ({ ...prev, ...fieldErrs }));
        throw new Error("Please fix entry fields");
      }

      const entryRes = await createEntry(entryParse.data);
      if (entryRes.error || !entryRes.data) {
        throw new Error(entryRes.error);
      }

      setSuccessMsg(
        `Entry #${entryRes.data.entry.id} saved for item #${entryRes.data.entry.itemId}.`
      );
      setSize("");
      setQuantity("");
    } catch (err: any) {
      setGlobalError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleScanDetected(scanned: string) {
    // called by CameraBarcodeScanner when a barcode is read
    handleBarcodeChange(scanned);
    setShowScanner(false);
  }

  return (
    <>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg md:text-xl flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span>Scan or Enter Barcode</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
              className="border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10"
            >
              Open camera scanner
            </Button>
          </CardTitle>
          <p className="text-xs md:text-sm text-slate-400">
            Existing items auto-fill. New barcodes create new items.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Barcode */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Scan or type barcode"
                  required
                />
              </div>
              <div className="flex items-end text-xs text-slate-400 min-h-[1.5rem]">
                {checking
                  ? "Checking..."
                  : itemExists
                  ? "Item found"
                  : barcode
                  ? "New item"
                  : ""}
              </div>
            </div>

            {/* Item details */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Item name"
                  disabled={itemExists}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-400">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="languageCode">Language</Label>
                <Input
                  id="languageCode"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  placeholder="en / de / am..."
                  disabled={itemExists}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description"
                  disabled={itemExists}
                />
              </div>
            </div>

            {/* Entry fields */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="500ml / small / etc."
                />
                {fieldErrors.size && (
                  <p className="text-xs text-red-400">{fieldErrors.size}</p>
                )}
              </div>
              <div className="space-y-1">
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
                  <p className="text-xs text-red-400">{fieldErrors.quantity}</p>
                )}
              </div>
            </div>

            {globalError && (
              <p className="text-xs text-red-400">{globalError}</p>
            )}
            {successMsg && (
              <p className="text-xs text-green-400">{successMsg}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !barcode}
            >
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showScanner && (
        <CameraBarcodeScanner
          onDetected={handleScanDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
