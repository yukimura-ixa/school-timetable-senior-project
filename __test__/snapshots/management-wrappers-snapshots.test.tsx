/**
 * @vitest-environment happy-dom
 *
 * Snapshot Tests – Management Client Wrappers
 * Captures DOM output for each management page in populated and empty states.
 */
import { vi } from "vitest";
import { render } from "@testing-library/react";
import { TeacherManageClient } from "@/app/management/teacher/component/TeacherManageClient";
import { RoomsManageClient } from "@/app/management/rooms/component/RoomsManageClient";
import { SubjectManageClient } from "@/app/management/subject/component/SubjectManageClient";
import { GradeLevelManageClient } from "@/app/management/gradelevel/component/GradeLevelManageClient";
import type {
  teacher,
  room,
  subject,
  gradelevel,
} from "@/prisma/generated/client";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock Server Actions
vi.mock("@/features/teacher/application/actions/teacher.actions", () => ({
  getTeachersAction: vi.fn(),
}));
vi.mock("@/features/room/application/actions/room.actions", () => ({
  getRoomsAction: vi.fn(),
}));
vi.mock("@/features/subject/application/actions/subject.actions", () => ({
  getSubjectsAction: vi.fn(),
}));
vi.mock("@/features/gradelevel/application/actions/gradelevel.actions", () => ({
  getGradeLevelsAction: vi.fn(),
}));

// ---------- Fixtures ----------
const sampleTeacher: teacher = {
  TeacherID: 1,
  Prefix: "นาย",
  Firstname: "สมชาย",
  Lastname: "ใจดี",
  Department: "คณิตศาสตร์",
  Email: "somchai@test.com",
  Role: "ADMIN",
};

const sampleRoom: room = {
  RoomID: 1,
  RoomName: "ห้อง 101",
  Building: "อาคาร 1",
  Floor: "1",
};

const sampleSubject: subject = {
  SubjectCode: "ค01",
  SubjectName: "คณิตศาสตร์พื้นฐาน",
  Credit: "CREDIT_10",
  Category: "พื้นฐาน",
  ProgramID: null,
};

const sampleGrade: gradelevel = {
  GradeID: "101",
  Year: 1,
  Number: 1,
  StudentCount: 30,
  ProgramID: null,
};

// ---------- Snapshots ----------

describe("TeacherManageClient snapshots", () => {
  it("populated state", () => {
    const { container } = render(
      <TeacherManageClient initialData={[sampleTeacher]} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("empty state", () => {
    const { container } = render(
      <TeacherManageClient initialData={[]} />,
    );
    expect(container).toMatchSnapshot();
  });
});

describe("RoomsManageClient snapshots", () => {
  it("populated state", () => {
    const { container } = render(
      <RoomsManageClient initialData={[sampleRoom]} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("empty state", () => {
    const { container } = render(<RoomsManageClient initialData={[]} />);
    expect(container).toMatchSnapshot();
  });
});

describe("SubjectManageClient snapshots", () => {
  it("populated state", () => {
    const { container } = render(
      <SubjectManageClient initialData={[sampleSubject]} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("empty state", () => {
    const { container } = render(<SubjectManageClient initialData={[]} />);
    expect(container).toMatchSnapshot();
  });
});

describe("GradeLevelManageClient snapshots", () => {
  it("populated state", () => {
    const { container } = render(
      <GradeLevelManageClient
        initialData={[sampleGrade]}
        programsByYear={{}}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it("empty state", () => {
    const { container } = render(
      <GradeLevelManageClient initialData={[]} programsByYear={{}} />,
    );
    expect(container).toMatchSnapshot();
  });
});
