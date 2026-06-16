/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintShell } from "@/components/print/PrintShell";

describe("PrintShell", () => {
  it("renders the title and children", () => {
    render(<PrintShell title="ตาราง ม.1/1"><div data-testid="kid" /></PrintShell>);
    expect(screen.getByText("ตาราง ม.1/1")).toBeInTheDocument();
    expect(screen.getByTestId("kid")).toBeInTheDocument();
  });
  it("emits the requested @page orientation", () => {
    const { container } = render(
      <PrintShell title="t" orientation="landscape"><span /></PrintShell>,
    );
    expect(container.querySelector("style")?.textContent).toContain("size: A4 landscape");
  });
  it("defaults to portrait", () => {
    const { container } = render(<PrintShell title="t"><span /></PrintShell>);
    expect(container.querySelector("style")?.textContent).toContain("size: A4 portrait");
  });
});
