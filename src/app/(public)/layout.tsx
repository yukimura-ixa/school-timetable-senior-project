/**
 * Public Layout - Minimal layout for public routes
 * No MUI providers - uses plain SVG icons to avoid build-time context issues
 */
import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "../globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน",
  description: "ระบบจัดการตารางเรียนตารางสอนออนไลน์",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className="font-sans min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
