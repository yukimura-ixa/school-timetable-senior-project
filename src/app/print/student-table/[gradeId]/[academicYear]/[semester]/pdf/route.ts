import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, normalizeAppRole } from "@/lib/authz";
import { parseCookieHeader } from "@/features/print/cookies";
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
  const origin = new URL(req.url).origin;

  // Forward the caller's session cookies so headless Chromium passes the
  // admin auth check on the print page (which also self-enforces admin auth).
  const cookies = parseCookieHeader(
    req.headers.get("cookie"),
    new URL(origin).hostname,
  );

  const pdf = await renderUrlToPdf(
    `${origin}/print/student-table/${gradeId}/${academicYear}/${semester}`,
    { landscape: false, cookies },
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="student-table-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
