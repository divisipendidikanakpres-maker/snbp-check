"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calculator, History, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "US";
}

export function NavBar() {
  const pathname = usePathname();
  const { me, logout } = useAuth();
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    me()
      .then(({ user }) => setUser(user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { href: "/beranda", label: "Kalkulator SNBP", icon: Calculator },
    { href: "/beranda/riwayat", label: "Riwayat Cek Saya", icon: History },
  ];

  return (
    <header className="bg-white border-b border-[#e0eded] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo + Title */}
        <div className="flex items-center gap-6">
          <Link href="/beranda" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#03989E]/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-800 leading-tight">SNBP Check</h1>
              <p className="text-[10px] text-[#03989E] font-semibold tracking-wide">RASIONALISASI NILAI</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-200">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                    active
                      ? "bg-[#03989E] text-white shadow-xs"
                      : "text-gray-600 hover:text-[#02747A] hover:bg-[#F8FAFA]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          {/* Mobile Nav Links Icon */}
          <div className="flex md:hidden items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "p-2 rounded-xl text-xs transition",
                    active ? "bg-[#03989E] text-white" : "text-gray-600 hover:bg-[#F8FAFA]"
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
              <div className="hidden sm:block text-right leading-none">
                <p className="text-xs font-bold text-gray-800 leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{user.email}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9 border-2 border-[#03989E]/20">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[#03989E] text-white font-bold text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg border border-[#e0eded]">
                  <div className="px-3 py-2 border-b border-gray-100 sm:hidden">
                    <p className="text-xs font-bold text-gray-800">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer py-2 px-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}


