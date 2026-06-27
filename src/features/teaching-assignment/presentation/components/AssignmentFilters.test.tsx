// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssignmentFilters } from "./AssignmentFilters";
import "@testing-library/jest-dom/vitest";

const defaultProps = {
  gradeId: "",
  semester: "SEMESTER_1" as const,
  academicYear: 2567,
  onGradeChange: vi.fn(),
  onSemesterChange: vi.fn(),
  onYearChange: vi.fn(),
};

describe("AssignmentFilters — hideGradeSelector", () => {
  it("renders grade selector by default", () => {
    render(<AssignmentFilters {...defaultProps} />);
    expect(screen.getByLabelText("ชั้นปี")).toBeInTheDocument();
  });

  it("hides grade selector when hideGradeSelector=true", () => {
    render(<AssignmentFilters {...defaultProps} hideGradeSelector />);
    expect(screen.queryByLabelText("ชั้นปี")).not.toBeInTheDocument();
  });

  it("keeps semester and year selectors visible when hideGradeSelector=true", () => {
    render(<AssignmentFilters {...defaultProps} hideGradeSelector />);
    expect(screen.getByLabelText("ภาคเรียน")).toBeInTheDocument();
    expect(screen.getByLabelText("ปีการศึกษา")).toBeInTheDocument();
  });
});
