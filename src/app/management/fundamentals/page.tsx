import { cookies } from "next/headers";
import { FundamentalsTemplateEditor } from "./component/FundamentalsTemplateEditor";

/**
 * Admin page for the per-grade CORE fundamentals template (grade_fundamental).
 * Server component; the editor self-fetches per selected year via SWR.
 */
export default async function FundamentalsManagePage() {
  // Force dynamic rendering for Next.js 16
  await cookies();
  return <FundamentalsTemplateEditor />;
}
