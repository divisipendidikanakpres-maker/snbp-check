"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Users, GraduationCap, School, History } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/akun", label: "Manajemen Akun", icon: Users },
  { href: "/admin/universitas", label: "Manajemen Universitas", icon: GraduationCap },
  { href: "/admin/sekolah", label: "Manajemen Sekolah", icon: School },
  { href: "/admin/riwayat", label: "Riwayat Cek", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#025e63] text-white min-h-[calc(100vh-57px)] rounded-tr-[32px] shadow-sm relative z-20 pt-10 pb-5 pl-4 pr-0 justify-between">
      {/* Menu List */}
      <nav className="flex-1 flex flex-col gap-1.5 pt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <div key={item.href} className="relative h-11 flex items-center">
              <Link
                href={item.href}
                className={cn(
                  "h-full flex items-center gap-3 px-4 text-xs font-semibold transition-all duration-300 ease-in-out relative z-10",
                  active
                    ? "w-full bg-[#F8FAFA] text-[#025e63] rounded-l-2xl font-bold shadow-xs"
                    : "w-[calc(100%-12px)] mr-3 text-white/80 hover:text-white hover:bg-white/15 rounded-xl"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-300",
                    active ? "text-[#025e63]" : "text-white/70"
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span className="truncate">{item.label}</span>

                {/* Inverted Curved Cutout for Active Tab */}
                {active && (
                  <>
                    <span className="absolute right-0 -top-4 w-4 h-4 pointer-events-none overflow-hidden animate-in fade-in duration-300">
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-br-2xl bg-[#025e63] shadow-[4px_4px_0_4px_#F8FAFA]" />
                    </span>
                    <span className="absolute right-0 -bottom-4 w-4 h-4 pointer-events-none overflow-hidden animate-in fade-in duration-300">
                      <span className="absolute top-0 right-0 w-4 h-4 rounded-tr-2xl bg-[#025e63] shadow-[4px_-4px_0_4px_#F8FAFA]" />
                    </span>
                  </>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="pt-4 border-t border-white/10 mt-auto pr-4">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 text-white/50" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}






