import { notFound } from "next/navigation";
import { resolveSelfRenderBase } from "@/features/print/cookies";
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

  const base = resolveSelfRenderBase(req);
  const printUrl = new URL(
    `/print/classes/${gradeId}/${academicYear}/${semester}`,
    base,
  ).toString();
  let pdf: Buffer;
  try {
    pdf = await renderUrlToPdf(printUrl, { landscape: false }); // public: no cookies
  } catch (err) {
    console.error("[print/classes] PDF render failed:", err);
    return new Response("ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="class-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
