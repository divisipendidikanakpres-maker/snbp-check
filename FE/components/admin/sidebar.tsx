"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/akun", label: "Manajemen Akun" },
  { href: "/admin/universitas", label: "Manajemen Universitas" },
  { href: "/admin/sekolah", label: "Manajemen Sekolah" },
  { href: "/admin/riwayat", label: "Riwayat Cek" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="w-64 shrink-0 border-r border-foreground/10 bg-card p-4 flex flex-col">
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </aside>
  );
}
