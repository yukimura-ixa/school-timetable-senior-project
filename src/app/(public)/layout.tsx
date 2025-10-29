/**
 * Public Layout - Minimal layout for public routes
 * No MUI providers - uses plain SVG icons to avoid build-time context issues
 * Note: html/body tags are handled by root layout (src/app/layout.tsx)
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน",
  description: "ระบบจัดการตารางเรียนตารางสอนออนไลน์",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
