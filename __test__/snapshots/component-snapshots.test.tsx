/**
 * @vitest-environment happy-dom
 *
 * Snapshot Tests – UI Components
 * Catches unintended visual regressions in reusable components.
 */
import { vi } from "vitest";
import { render } from "@testing-library/react";
import Button from "@/components/elements/static/Button";

describe("Button Component Snapshots", () => {
  it("renders default state", () => {
    const { container } = render(
      <Button icon="/icon.svg" title="Default Button" />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders disabled state", () => {
    const { container } = render(
      <Button icon="/icon.svg" title="Disabled" disabled />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with custom colors", () => {
    const { container } = render(
      <Button
        icon="/icon.svg"
        title="Colored"
        buttonColor="#4CAF50"
        titleColor="#FFFFFF"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with icon on the right", () => {
    const { container } = render(
      <Button icon="/icon.svg" title="Right Icon" iconPosition="right" />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders React element icon", () => {
    const { container } = render(
      <Button
        icon={<span data-testid="star-icon">★</span>}
        title="Element Icon"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders with custom dimensions", () => {
    const { container } = render(
      <Button icon="/icon.svg" title="Sized" width={200} height={50} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders without title (icon only)", () => {
    const { container } = render(<Button icon="/icon.svg" title="" />);
    expect(container).toMatchSnapshot();
  });
});
