import ProgramSubjectAssignmentPage from "./component/ProgramSubjectAssignmentPage";

export default function Page({ params }: { params: { programId: string } }) {
  return <ProgramSubjectAssignmentPage programId={Number(params.programId)} />;
}
