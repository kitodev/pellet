import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Adminisztráció – Pellet Centrum Kft.", template: "%s – Pellet Centrum Kft." },
  description: "Termékek és weboldalszövegek kezelése.",
  robots: { index: false, follow: false },
  icons: { icon: "/images/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
