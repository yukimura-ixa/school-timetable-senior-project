import { GenerateClient } from "./_components/GenerateClient";

/**
 * Step 4 — Whole-school auto-generate (headline action).
 *
 * Thin server shell: resolves the term params and mounts the client island
 * that POSTs to /api/schedule/auto-arrange-all and renders the result panel.
 */
export default async function GenerateStepPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  const reviewHref = `/schedule/${academicYear}/${semester}/arrange`;

  return (
    <GenerateClient
      academicYear={academicYear}
      semester={semester}
      reviewHref={reviewHref}
    />
  );
}
