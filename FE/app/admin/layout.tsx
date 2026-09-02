"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { me } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    me()
      .then(({ user }) => {
        if (user.role !== "ADMIN") {
          router.replace("/beranda");
          return;
        }
        setUser(user);
        setChecked(true);
      })
      .catch(() => {
        router.replace("/");
      });
  }, []);

  if (!checked) return null;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFA]">
      {/* Top Header Bar — Spans 100% full width across the top */}
      <header className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center justify-between gap-6 sticky top-0 z-30 shadow-xs">
        
        {/* Far Left — Logo & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#03989E]/10 flex items-center justify-center">
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-gray-800 leading-tight">SNBP Check</h1>
            <p className="text-[10px] text-[#03989E] font-semibold tracking-wide">ADMIN PANEL</p>
          </div>
        </div>

        {/* Far Right — Notification + Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          <div className="w-px h-6 bg-gray-200" />

          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 border-2 border-[#03989E]/20">
              <AvatarFallback className="bg-[#03989E] text-white font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.fullName}</p>
              <p className="text-[10px] text-[#03989E] font-semibold uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body Area below Header */}
      <div className="flex flex-1 flex-col md:flex-row min-h-0">
        {/* Sidebar (Positioned under header with rounded container shape) */}
        <AdminSidebar />

        {/* Main Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


