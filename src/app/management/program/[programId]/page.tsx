import ProgramSubjectAssignmentPage from "./component/ProgramSubjectAssignmentPage";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return <ProgramSubjectAssignmentPage programId={Number(programId)} />;
}
