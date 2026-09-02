"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function BerandaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { me } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    me()
      .then(() => setChecked(true))
      .catch(() => router.replace("/"));
  }, []);

  if (!checked) return null;

  return <>{children}</>;
}

