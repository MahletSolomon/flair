import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { entries } from "@/db/schema";
import { createEntrySchema } from "@/lib/validation/items";

export async function POST(req: NextRequest) {
    try {
  const body = await req.json();
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { itemId, size, quantity, buyingPrice, sellingPrice } = parsed.data;

  const [created] = await db
    .insert(entries)
    .values({
      itemId,
      size: size ?? null,          // nullable in DB
      quantity,
      buyingPrice,                 // ⬅ new
      sellingPrice,                // ⬅ new
    })
    .returning();

  return NextResponse.json({ data: created });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
}
