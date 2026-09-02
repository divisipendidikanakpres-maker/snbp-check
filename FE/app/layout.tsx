import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rasionalisasi SNBP",
  description:
    "Bandingkan nilai rapor dan TKA kamu dengan estimasi nilai minimum SNBP setiap jurusan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
