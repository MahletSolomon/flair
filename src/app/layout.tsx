import type { Metadata } from "next";
import "./globals.css";
import { SidebarToggle, AppSidebar } from "@/components/layout/app-sidebar";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Top bar (stays fixed width; sidebar overlays via Sheet) */}
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarToggle />
              <span className="font-semibold">Inventory</span>
            </div>
            <div />
          </div>
        </header>

        {/* Sidebar overlay lives at root so it can cover everything */}
        <AppSidebar />

        {/* Page content */}
        <main className="container mx-auto px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
