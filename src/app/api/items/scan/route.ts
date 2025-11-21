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
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 },
      );
    }

    const { barcode, name, description, languageCode } = parsed.data;

    const existing = await db
      .select()
      .from(items)
      .where(eq(items.barcode, barcode));

    let item = existing[0];

    if (!item) {
      const inserted = await db
        .insert(items)
        .values({
          barcode,
          name: name ?? null,
          description: description ?? null,
          languageCode: languageCode ?? null,
        })
        .returning();

      item = inserted[0];
    }

    await db.insert(scans).values({ itemId: item.id });

    return NextResponse.json({ data: item });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
