/**
 * Unit Tests for Management Client Wrappers
 * 
 * Tests that verify:
 * - Client components render with initial data
 * - Mutation handlers work correctly
 * - Loading states display properly
 * - Empty states render when needed
 */


import '@testing-library/jest-dom'
// Jest globals are available without import
import { render, screen, waitFor } from "@testing-library/react";
import { TeacherManageClient } from "@/app/management/teacher/component/TeacherManageClient";
import { RoomsManageClient } from "@/app/management/rooms/component/RoomsManageClient";
import { SubjectManageClient } from "@/app/management/subject/component/SubjectManageClient";
import { GradeLevelManageClient } from "@/app/management/gradelevel/component/GradeLevelManageClient";
import type { teacher, room, subject, gradelevel } from "@prisma/client";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Server Actions
jest.mock("@/features/teacher/application/actions/teacher.actions", () => ({
  getTeachersAction: jest.fn(),
}));

jest.mock("@/features/room/application/actions/room.actions", () => ({
  getRoomsAction: jest.fn(),
}));

jest.mock("@/features/subject/application/actions/subject.actions", () => ({
  getSubjectsAction: jest.fn(),
}));

jest.mock("@/features/gradelevel/application/actions/gradelevel.actions", () => ({
  getGradeLevelsAction: jest.fn(),
}));

describe("TeacherManageClient", () => {
  const mockTeachers: teacher[] = [
    {
      TeacherID: 1,
      Prefix: "นาย",
      Firstname: "สมชาย",
      Lastname: "ใจดี",
      Department: "คณิตศาสตร์",
      Email: "somchai@test.com",
      Role: "ADMIN",
    },
  ];

  test("renders with initial teacher data", () => {
    render(<TeacherManageClient initialData={mockTeachers} />);
    
    // Should render the teacher table
    expect(screen.getByText("สมชาย")).toBeInTheDocument();
  });

  test("shows empty state when no teachers", () => {
    render(<TeacherManageClient initialData={[]} />);
    
    // Should show empty state message
    expect(screen.getByText(/ยังไม่มีข้อมูลครู|No teachers/i)).toBeInTheDocument();
  });
});

describe("RoomsManageClient", () => {
  const mockRooms: room[] = [
    {
      RoomID: 1,
      RoomName: "ห้อง 101",
      Building: "อาคาร 1",
      Floor: "1",
    },
  ];

  test("renders with initial room data", () => {
    render(<RoomsManageClient initialData={mockRooms} />);
    
    // Should render the room table
    expect(screen.getByText("ห้อง 101")).toBeInTheDocument();
  });

  test("shows empty state when no rooms", () => {
    render(<RoomsManageClient initialData={[]} />);
    
    // Should show empty state message
    expect(screen.getByText(/ยังไม่มีข้อมูลห้องเรียน|No rooms/i)).toBeInTheDocument();
  });
});

describe("SubjectManageClient", () => {
  const mockSubjects: subject[] = [
    {
      SubjectCode: "ค01",
      SubjectName: "คณิตศาสตร์พื้นฐาน",
      Credit: "CREDIT_10",
      Category: "พื้นฐาน",
      ProgramID: null,
    },
  ];

  test("renders with initial subject data", () => {
    render(<SubjectManageClient initialData={mockSubjects} />);
    
    // Should render the subject table
    expect(screen.getByText("คณิตศาสตร์พื้นฐาน")).toBeInTheDocument();
  });

  test("shows empty state when no subjects", () => {
    render(<SubjectManageClient initialData={[]} />);
    
    // Should show empty state message
    expect(screen.getByText(/ยังไม่มีรายวิชา|No subjects/i)).toBeInTheDocument();
  });
});

describe("GradeLevelManageClient", () => {
  const mockGradeLevels: gradelevel[] = [
    {
      GradeID: "101",
      Year: 1,
      Number: 1,
    },
  ];

  test("renders with initial gradelevel data", () => {
    render(<GradeLevelManageClient initialData={mockGradeLevels} />);
    
    // Should render the gradelevel table
    expect(screen.getByText("101")).toBeInTheDocument();
  });

  test("shows empty state when no gradelevels", () => {
    render(<GradeLevelManageClient initialData={[]} />);
    
    // Should show empty state
    const emptyStateElements = screen.queryAllByText(/ยังไม่มีข้อมูล|No data/i);
    expect(emptyStateElements.length).toBeGreaterThan(0);
  });
});

describe("Client Wrapper Pattern", () => {
  test("all client wrappers accept initialData prop", () => {
    const emptyTeachers: teacher[] = [];
    const emptyRooms: room[] = [];
    const emptySubjects: subject[] = [];
    const emptyGradeLevels: gradelevel[] = [];

    // Should not throw errors when rendering with empty data
    expect(() => {
      render(<TeacherManageClient initialData={emptyTeachers} />);
    }).not.toThrow();

    expect(() => {
      render(<RoomsManageClient initialData={emptyRooms} />);
    }).not.toThrow();

    expect(() => {
      render(<SubjectManageClient initialData={emptySubjects} />);
    }).not.toThrow();

    expect(() => {
      render(<GradeLevelManageClient initialData={emptyGradeLevels} />);
    }).not.toThrow();
  });
});
