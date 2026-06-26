// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { SelectClassRoomModal } from "./SelectClassRoomModal";

const baseProps = {
  open: true,
  year: 1,
  availableRooms: ["101", "102", "103"],
  selected: [] as string[],
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe("SelectClassRoomModal", () => {
  it("renders a toggle for each available room in the year", () => {
    render(<SelectClassRoomModal {...baseProps} />);
    expect(screen.getByRole("button", { name: "ม.1/1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ม.1/2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ม.1/3" })).toBeInTheDocument();
  });

  it("confirms with the rooms the user selected", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <SelectClassRoomModal
        {...baseProps}
        selected={["101"]}
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: "ม.1/3" }));
    await user.click(screen.getByRole("button", { name: "ยืนยัน" }));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.arrayContaining(["101", "103"]),
      1,
    );
    expect(onConfirm.mock.calls[0]![0]).toHaveLength(2);
  });
});
