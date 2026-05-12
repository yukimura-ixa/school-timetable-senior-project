// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyPreviousStep } from "./CopyPreviousStep";
import {
  CreateSemesterProvider,
  useCreateSemester,
} from "../CreateSemesterContext";
import type { SemesterDTO } from "@/features/semester/application/schemas/semester.schemas";

function ProviderHarness({
  children,
  initialCopyFrom,
}: {
  children: React.ReactNode;
  initialCopyFrom?: string;
}) {
  return (
    <CreateSemesterProvider>
      <CopyFromSeeder initialCopyFrom={initialCopyFrom} />
      {children}
    </CreateSemesterProvider>
  );
}

function CopyFromSeeder({ initialCopyFrom }: { initialCopyFrom?: string }) {
  const { setCopyFrom } = useCreateSemester();
  if (initialCopyFrom && !seedDone.current) {
    seedDone.current = true;
    setCopyFrom(initialCopyFrom);
  }
  return null;
}
const seedDone = { current: false };

function StateProbe() {
  const { copyAssignments } = useCreateSemester() as ReturnType<
    typeof useCreateSemester
  > & { copyAssignments: boolean };
  return <div data-testid="probe-copy-assignments">{String(copyAssignments)}</div>;
}

const existingSemesters: SemesterDTO[] = [
  {
    configId: "1-2567",
    academicYear: 2567,
    semester: 1,
    status: "DRAFT",
    isPinned: false,
    configCompleteness: 0,
    lastAccessedAt: undefined,
    publishedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    timeslotCount: 0,
    classCount: 0,
    teacherCount: 0,
    roomCount: 0,
    subjectCount: 0,
  },
];

describe("CopyPreviousStep — copy assignments checkbox", () => {
  it("does NOT render the assignments checkbox when no source semester selected", () => {
    render(
      <CreateSemesterProvider>
        <CopyPreviousStep existingSemesters={existingSemesters} />
      </CreateSemesterProvider>,
    );
    expect(
      screen.queryByLabelText(/คัดลอกการมอบหมายครู/),
    ).not.toBeInTheDocument();
  });

  it("renders the assignments checkbox when a source semester is selected, default unchecked", () => {
    seedDone.current = false;
    render(
      <ProviderHarness initialCopyFrom="1-2567">
        <CopyPreviousStep existingSemesters={existingSemesters} />
      </ProviderHarness>,
    );

    const checkbox = screen.getByLabelText(/คัดลอกการมอบหมายครู/);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("toggles copyAssignments state when clicked", async () => {
    seedDone.current = false;
    const user = userEvent.setup();
    render(
      <ProviderHarness initialCopyFrom="1-2567">
        <CopyPreviousStep existingSemesters={existingSemesters} />
        <StateProbe />
      </ProviderHarness>,
    );

    const probe = screen.getByTestId("probe-copy-assignments");
    expect(probe.textContent).toBe("false");

    await user.click(screen.getByLabelText(/คัดลอกการมอบหมายครู/));
    expect(probe.textContent).toBe("true");
  });
});

// jest-dom matcher imports
import "@testing-library/jest-dom/vitest";
