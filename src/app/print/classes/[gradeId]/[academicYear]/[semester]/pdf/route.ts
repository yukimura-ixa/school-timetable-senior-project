import { notFound } from "next/navigation";
import { getBaseUrl } from "@/utils/canonical-url";
import { renderUrlToPdf } from "@/features/print/render-pdf";

type Params = { gradeId: string; academicYear: string; semester: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { gradeId, academicYear, semester } = await params;
  if (
    !/^[A-Za-z0-9._-]+$/.test(gradeId) ||
    !/^\d+$/.test(academicYear) ||
    !/^\d+$/.test(semester)
  ) {
    notFound();
  }

  // Trusted, server-configured base in production (never the Host header, to
  // avoid SSRF); same-origin self-fetch only in local dev.
  const base =
    process.env.NODE_ENV === "production"
      ? getBaseUrl()
      : new URL(req.url).origin;
  const printUrl = new URL(
    `/print/classes/${gradeId}/${academicYear}/${semester}`,
    base,
  ).toString();
  const pdf = await renderUrlToPdf(printUrl, { landscape: false }); // public: no cookies
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="class-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
