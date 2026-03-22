import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AG Grid Demo",
  description: "AG Grid Enterprise feature demos with Next.js and FastAPI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-ag-theme-mode="dark">
      <body className="bg-ctp-base text-ctp-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
