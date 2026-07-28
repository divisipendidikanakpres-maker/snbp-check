"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
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
}

export function NavBar({ title = "" }: NavBarProps) {
  const { me, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="flex items-center justify-between border-b border-foreground/10 bg-card px-4 md:px-6 py-4 shadow-sm">
      <div className="text-lg font-semibold text-foreground">{title}</div>
      <AvatarDropdown getInitials={getInitials} onLogout={handleLogout} />
    </nav>
  );
}

function AvatarDropdown({
  getInitials,
  onLogout,
}: {
  getInitials: (name: string) => string;
  onLogout: () => Promise<void>;
}) {
  const { me } = useAuth();
  const [fullName, setFullName] = React.useState<string | null>(null);

  React.useEffect(() => {
    me()
      .then(({ user }) => setFullName(user.fullName))
      .catch(() => {});
  }, [me]);

  if (!fullName) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
