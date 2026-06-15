import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NavDash Harbor",
  description: "Vessel operations management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
