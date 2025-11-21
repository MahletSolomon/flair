import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { entries } from "@/db/schema";
import { createEntrySchema } from "@/lib/validation/items";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const [created] = await db.insert(entries).values({
    itemId: parsed.data.itemId,
    size: parsed.data.size,
    quantity: parsed.data.quantity,
  }).returning();

  return NextResponse.json({ data: created });
}
