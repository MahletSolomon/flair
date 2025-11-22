import { getAllItems } from "@/lib/dal/items";
import Link from "next/link";

export default async function ItemsPage() {
  const res = await getAllItems();
  console.log("ItemsPage res:", res);

  const items = res.data ?? [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">All Items</h1>
          <Link
            href="/"
            className="text-sm text-slate-300 hover:text-white underline"
          >
            ← Back to scanner
          </Link>
        </div>

        {res.error && <p className="text-sm text-red-400">{res.error}</p>}

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <th className="px-3 py-2 text-left">Barcode</th>
                <th className="px-3 py-2 text-left hidden sm:table-cell">
                  Name
                </th>
                <th className="px-3 py-2 text-left hidden md:table-cell">
                  Language
                </th>
                <th className="px-3 py-2 text-left hidden lg:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2 break-all">{item.barcode}</td>
                  <td className="px-3 py-2 hidden sm:table-cell">
                    {item.name ?? "-"}
                  </td>
                  {/* <td className="px-3 py-2 hidden md:table-cell">
                    {item.languageCode ?? "-"}
                  </td> */}
                  <td className="px-3 py-2 hidden lg:table-cell text-xs text-slate-400">
                    {typeof item.createdAt === "string"
                      ? item.createdAt
                      : item.createdAt?.toISOString?.() ?? ""}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !res.error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-center text-slate-400"
                  >
                    No items yet. Go scan something on the home page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
