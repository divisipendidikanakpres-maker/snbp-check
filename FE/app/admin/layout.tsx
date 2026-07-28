"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { NavBar } from "@/components/nav-bar";

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

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar title="Admin Panel" />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
