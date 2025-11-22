import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh grid grid-cols-[220px_1fr]">
          <aside className="border-r border-slate-200 bg-slate-50">
            <div className="px-4 py-4">
              <h1 className="text-lg font-semibold">Inventory</h1>
            </div>
            <nav className="px-2 space-y-1 text-sm">
              <Link
                href="/items"
                className="block rounded-md px-3 py-2 hover:bg-slate-100"
              >
                All Items
              </Link>
              <Link
                href="/"
                className="block rounded-md px-3 py-2 hover:bg-slate-100"
              >
                New Item
              </Link>
            </nav>
          </aside>

          <main className="p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
