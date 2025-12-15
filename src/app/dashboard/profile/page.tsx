import ProfilePage from "./ProfilePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "โปรไฟล์ | ระบบจัดตารางเรียนตารางสอน",
  description: "จัดการข้อมูลส่วนตัว รหัสผ่าน และอีเมล",
};

/**
 * Profile Page - Server Component
 *
 * Inherits authentication protection from dashboard layout.
 * Renders the ProfilePage client component for interactive forms.
 */
export default function Page() {
  return <ProfilePage />;
}
