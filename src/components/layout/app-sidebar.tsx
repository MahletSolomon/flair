"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Package, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils"; // your cn helper; or inline className logic

export function SidebarToggle() {
  // A small button you can place in your header
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="lg:hidden"
      asChild
    >
      {/* This acts as a trigger for the sheet via data-state attr; see AppSidebar */}
      <span data-sidebar-trigger="true">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open sidebar</span>
      </span>
    </Button>
  );
}

export function AppSidebar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // We’ll wire any element with [data-sidebar-trigger] to open the sheet:
  React.useEffect(() => {
    function onClick(e: Event) {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("[data-sidebar-trigger]")) setOpen(true);
    }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const nav = [
    {
      href: "/items",
      label: "All Items",
      icon: Package,
      isActive: pathname === "/items",
    },
    {
      href: "/",
      label: "New Item",
      icon: PlusSquare,
      isActive: pathname === "/",
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* We don’t render a SheetTrigger here; we control open via data attribute */}
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle className="text-base">Inventory</SheetTitle>
        </SheetHeader>

        <nav className="p-2">
          {nav.map(({ href, label, icon: Icon, isActive }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100",
                isActive && "bg-slate-100 font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
