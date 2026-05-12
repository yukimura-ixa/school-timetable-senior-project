// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeacherWorkloadCard } from "./TeacherWorkloadCard";
import "@testing-library/jest-dom/vitest";

describe("TeacherWorkloadCard", () => {
  it("renders teach hours, subject count, class count", () => {
    render(
      <TeacherWorkloadCard
        teachHour={18}
        subjectCount={5}
        classCount={4}
      />,
    );
    expect(screen.getByTestId("workload-teach-hour")).toHaveTextContent("18");
    expect(screen.getByTestId("workload-subject-count")).toHaveTextContent(
      "5",
    );
    expect(screen.getByTestId("workload-class-count")).toHaveTextContent("4");
  });

  it("does NOT show warning when teachHour at or below threshold (default 22)", () => {
    render(
      <TeacherWorkloadCard teachHour={22} subjectCount={5} classCount={4} />,
    );
    expect(screen.queryByTestId("workload-warning")).not.toBeInTheDocument();
  });

  it("shows warning when teachHour exceeds default threshold (22)", () => {
    render(
      <TeacherWorkloadCard teachHour={23} subjectCount={5} classCount={4} />,
    );
    expect(screen.getByTestId("workload-warning")).toBeInTheDocument();
  });

  it("respects custom warningThreshold", () => {
    render(
      <TeacherWorkloadCard
        teachHour={16}
        subjectCount={5}
        classCount={4}
        warningThreshold={15}
      />,
    );
    expect(screen.getByTestId("workload-warning")).toBeInTheDocument();
  });

  it("renders zero values without crashing", () => {
    render(
      <TeacherWorkloadCard teachHour={0} subjectCount={0} classCount={0} />,
    );
    expect(screen.getByTestId("workload-teach-hour")).toHaveTextContent("0");
    expect(screen.queryByTestId("workload-warning")).not.toBeInTheDocument();
  });
});
