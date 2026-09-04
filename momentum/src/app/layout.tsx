import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentum",
  description: "Your personal dashboard to start every day with focus.",
  themeColor: "#1e1b4b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
