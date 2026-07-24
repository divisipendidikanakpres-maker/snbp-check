"use client";

import { useEffect, useState } from "react";
import { useAuth, type AuthUser } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

interface NavBarProps {
  title?: string;
  user?: AuthUser;
}

export function NavBar({ title = "", user: propUser }: NavBarProps) {
  const { me, logout } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(propUser ?? null);
  const [loading, setLoading] = useState(!propUser);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    me()
      .then(({ user }) => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [propUser, me]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex items-center justify-between border-b border-foreground/10 bg-card px-6 py-4 shadow-sm">
      <div className="text-lg font-semibold text-foreground">{title}</div>
      {!loading && user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
