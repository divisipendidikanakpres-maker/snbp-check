"use client";

interface NavBarAdminProps {
  title?: string;
}

export function NavBarAdmin({ title = "" }: NavBarAdminProps) {
  return (
    <nav className="flex items-center justify-between border-b border-foreground/10 bg-card px-6 py-4 shadow-sm">
      <div className="text-lg font-semibold text-foreground">{title}</div>
    </nav>
  );
}
