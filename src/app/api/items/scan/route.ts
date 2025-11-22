import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { items, scans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createItemSchema } from "@/lib/validation/items";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    // Ensure barcode is always a string (default to "123" if not provided)
    const barcode: string = parsed.data.barcode ?? "123";
    const name = parsed.data.name ?? null;

    // Look up existing item by barcode
    const existing = await db
      .select()
      .from(items)
      .where(eq(items.barcode, barcode))
      .limit(1);

    let item = existing[0];

    // Create item if it doesn't exist
    if (!item) {
      const inserted = await db
        .insert(items)
        .values({
          barcode,
          name, // nullable column is fine with null
          // description: description ?? null,
          // languageCode: languageCode ?? null,
        })
        .returning();

      item = inserted[0];
    }

    // Record a scan for this item
    await db.insert(scans).values({ itemId: item.id });

    return NextResponse.json({ data: item });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
