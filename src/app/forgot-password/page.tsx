import type { Metadata } from "next";
import ForgotPasswordPageClient from "./ForgotPasswordPageClient";
import { createMetadataWithCanonical } from "@/utils/canonical-url";

export const metadata: Metadata = createMetadataWithCanonical({
  title: "ลืมรหัสผ่าน - ระบบตารางเรียนโรงเรียนพระซองสามัคคีวิทยา",
  description:
    "รีเซ็ตรหัสผ่านของระบบตารางเรียนตารางสอน โรงเรียนพระซองสามัคคีวิทยา ผ่านอีเมลที่ลงทะเบียนไว้",
  path: "/forgot-password",
  robots: { index: false, follow: true },
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
