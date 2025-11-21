import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { items } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const allItems = await db
    .select()
    .from(items)
    .orderBy(desc(items.createdAt));

  return NextResponse.json({ data: allItems });
}
