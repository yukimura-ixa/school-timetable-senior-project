import { ConfigSummaryClient } from "./_components/ConfigSummaryClient";
export default async function ConfigStepPage({
  params,
}: {
  params: Promise<{ academicYear: string; semester: string }>;
}) {
  const { academicYear, semester } = await params;
  const year = parseInt(academicYear, 10);
  const sem = parseInt(semester, 10) as 1 | 2;
  const configId = `${sem}-${year}`;

  return (
    <ConfigSummaryClient
      academicYear={year}
      semester={sem}
      configId={configId}
    />
  );
}
