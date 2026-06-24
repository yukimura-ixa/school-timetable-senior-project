import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { parseCookieHeader, resolveSelfRenderBase } from "@/features/print/cookies";
import { renderUrlToPdf } from "@/features/print/render-pdf";

type Params = { gradeId: string; academicYear: string; semester: string };

export async function GET(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  // Admin-only: /print/* is public at the middleware layer (see src/proxy.ts).
  // Enforce admin auth here — non-admin sessions get 404.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !isAdminRole(normalizeAppRole(session.user?.role))) {
    notFound();
  }

  const { gradeId, academicYear, semester } = await params;
  if (
    !/^[A-Za-z0-9._-]+$/.test(gradeId) ||
    !/^\d+$/.test(academicYear) ||
    !/^\d+$/.test(semester)
  ) {
    notFound();
  }

  const base = resolveSelfRenderBase(req);

  // Forward the caller's session cookies so headless Chromium passes the admin
  // auth check on the print page (which also self-enforces admin auth). Under
  // https the session cookie is __Secure-prefixed, so mark it Secure or Chromium
  // drops it.
  const baseUrl = new URL(base);
  const cookies = parseCookieHeader(
    req.headers.get("cookie"),
    baseUrl.hostname,
    baseUrl.protocol === "https:",
  );

  const printUrl = new URL(
    `/print/student-table/${gradeId}/${academicYear}/${semester}`,
    base,
  ).toString();

  let pdf: Buffer;
  try {
    pdf = await renderUrlToPdf(printUrl, { landscape: false, cookies });
  } catch (err) {
    console.error("[print/student-table] PDF render failed:", err);
    return new Response("ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="student-table-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
