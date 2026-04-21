// @vitest-environment happy-dom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ConflictSuggestionList from "./ConflictSuggestionList";
import type { ResolutionSuggestion } from "../../domain/models/conflict.model";

const suggestions: ResolutionSuggestion[] = [
  {
    kind: "RE_ROOM",
    targetRoomId: 11,
    targetRoomName: "R-11",
    rationale: "ย้ายไปห้อง R-11 (คาบเดิม)",
    confidence: 0.9,
  },
  {
    kind: "MOVE",
    targetTimeslotId: "1-2567-MON-2",
    rationale: "ย้ายไปคาบ 2 วันMON",
    confidence: 0.78,
  },
];

describe("ConflictSuggestionList", () => {
  it("renders one row per suggestion", () => {
    render(
      <ConflictSuggestionList
        suggestions={suggestions}
        isLoading={false}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getAllByTestId("conflict-suggestion-row")).toHaveLength(2);
  });

  it("shows empty state when no suggestions", () => {
    render(
      <ConflictSuggestionList
        suggestions={[]}
        isLoading={false}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getByText("ไม่พบข้อเสนอแนะ")).toBeDefined();
  });

  it("shows loading state", () => {
    render(
      <ConflictSuggestionList
        suggestions={[]}
        isLoading={true}
        onApply={vi.fn()}
      />,
    );
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("calls onApply with the correct suggestion when apply clicked", () => {
    const onApply = vi.fn();
    render(
      <ConflictSuggestionList
        suggestions={suggestions}
        isLoading={false}
        onApply={onApply}
      />,
    );
    const buttons = screen.getAllByTestId("conflict-suggestion-apply");
    fireEvent.click(buttons[1]!);
    expect(onApply).toHaveBeenCalledWith(suggestions[1]);
  });
});
