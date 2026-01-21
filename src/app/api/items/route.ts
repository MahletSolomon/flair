import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { items, entries } from "@/db/schema";
import { desc, sql, ilike, or } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10)));
    const offset = (page - 1) * pageSize;

    // Build base query with optional search filter
    let baseQuery = db.select().from(items);

    if (search) {
      baseQuery = baseQuery.where(
        or(
          ilike(items.name, `%${search}%`),
          ilike(items.barcode, `%${search}%`)
        )
      ) as typeof baseQuery;
    }

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(
        search
          ? or(
            ilike(items.name, `%${search}%`),
            ilike(items.barcode, `%${search}%`)
          )
          : undefined
      );
    const totalItems = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated items
    const allItems = await baseQuery
      .orderBy(desc(items.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Get aggregated entry data for the retrieved items
    const itemIds = allItems.map((item) => item.id);
    let entrySummary: { itemId: number; totalQuantity: number; avgBuyingPrice: number; avgSellingPrice: number }[] = [];

    if (itemIds.length > 0) {
      entrySummary = await db
        .select({
          itemId: entries.itemId,
          totalQuantity: sql<number>`COALESCE(SUM(${entries.quantity}), 0)`,
          avgBuyingPrice: sql<number>`COALESCE(AVG(${entries.buyingPrice}), 0)`,
          avgSellingPrice: sql<number>`COALESCE(AVG(${entries.sellingPrice}), 0)`,
        })
        .from(entries)
        .where(sql`${entries.itemId} = ANY(${itemIds})`)
        .groupBy(entries.itemId);
    }

    // Create a map for quick lookup
    const entryMap = new Map(
      entrySummary.map((e) => [e.itemId, e])
    );

    // Combine the data
    const result = allItems.map((item) => ({
      ...item,
      totalQuantity: entryMap.get(item.id)?.totalQuantity ?? 0,
      avgBuyingPrice: entryMap.get(item.id)?.avgBuyingPrice ?? 0,
      avgSellingPrice: entryMap.get(item.id)?.avgSellingPrice ?? 0,
    }));

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/items error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
