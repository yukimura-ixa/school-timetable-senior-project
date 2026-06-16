import { renderUrlToPdf } from "@/features/print/render-pdf";

type Params = { gradeId: string; academicYear: string; semester: string };

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { gradeId, academicYear, semester } = await params;
  const origin = new URL(req.url).origin;
  const printUrl = `${origin}/print/classes/${gradeId}/${academicYear}/${semester}`;
  const pdf = await renderUrlToPdf(printUrl, { landscape: false }); // public: no cookies
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="class-${gradeId}-${academicYear}-${semester}.pdf"`,
    },
  });
}
