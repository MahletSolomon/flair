import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkBarcodeSchema } from "@/lib/validation/items";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode");

  const parsed = checkBarcodeSchema.safeParse({ barcode });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.format() },
      { status: 400 },
    );
  }

  const result = await db
    .select()
    .from(items)
    .where(eq(items.barcode, parsed.data.barcode));

  if (result.length === 0) {
    return NextResponse.json({ exists: false, item: null });
  }

  return NextResponse.json({ exists: true, item: result[0] });
}
