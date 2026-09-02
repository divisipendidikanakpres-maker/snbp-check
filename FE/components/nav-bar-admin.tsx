"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import * as React from "react";

interface NavBarAdminProps {
  title?: string;
}

export function NavBarAdmin({ title = "" }: NavBarAdminProps) {
  const { me } = useAuth();
  const [fullName, setFullName] = React.useState<string | null>(null);

  React.useEffect(() => {
    me()
      .then(({ user }) => setFullName(user.fullName))
      .catch(() => {});
  }, [me]);

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 shadow-sm"
      style={{ background: '#02747A' }}
    >
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      {fullName && (
        <span className="text-sm font-medium text-white/80">{fullName}</span>
      )}
    </nav>
  );
}

