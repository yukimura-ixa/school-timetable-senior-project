import { cookies } from "next/headers";
import type { Metadata } from "next";
import { FundamentalsTemplateEditor } from "./component/FundamentalsTemplateEditor";

export const metadata: Metadata = {
  title: "เทมเพลตวิชาพื้นฐาน - Phrasongsa Timetable",
  description: "จัดการวิชาพื้นฐาน (CORE) รายชั้นที่ทุกหลักสูตรสืบทอด",
};

/**
 * Admin page for the per-grade CORE fundamentals template (grade_fundamental).
 * Server component; the editor self-fetches per selected year via SWR.
 */
export default async function FundamentalsManagePage() {
  // Force dynamic rendering for Next.js 16
  await cookies();
  return <FundamentalsTemplateEditor />;
}
