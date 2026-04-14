import { ReactNode } from "react";
import { redirect, forbidden } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { normalizeAppRole, isAdminRole } from "@/lib/authz";

export const metadata: Metadata = {
  title: "แดชบอร์ด - ระบบตารางเรียนโรงเรียนพระซองสามัคคีวิทยา",
  description:
    "จัดการตารางเรียนตารางสอน เลือกภาคเรียน และจัดการข้อมูลระบบ สำหรับผู้ดูแลระบบโรงเรียนพระซองสามัคคีวิทยา",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/dashboard",
  },
};

/**
 * Dashboard Layout - Server Component
 *
 * Protects all dashboard routes with server-side authentication.
 * Redirects unauthenticated users to the signin page.
 * Only allows admin role access (403 for non-admin).
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  // Admin-only access
  const userRole = normalizeAppRole(session.user?.role);
  if (!isAdminRole(userRole)) {
    forbidden();
  }

  return <>{children}</>;
}
