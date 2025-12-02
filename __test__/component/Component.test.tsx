import { vi, MockedObject, Mock } from "vitest";
/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import Button from "@/components/elements/static/Button";

describe("Button component", () => {
  it("renders provided title", () => {
    render(<Button icon="/icon.svg" title="My button" />);

    expect(screen.getByText("My button")).toBeInTheDocument();
  });

  it("displays icon alt text when iconAlt prop is provided", () => {
    render(<Button icon="/icon.svg" iconAlt="Custom icon" />);

    expect(screen.getByAltText("Custom icon")).toBeInTheDocument();
  });

  it("calls the provided click handler when clicked", () => {
    const handleClick = vi.fn();
    render(
      <Button icon="/icon.svg" title="Clickable" handleClick={handleClick} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Clickable/ }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call the click handler when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button
        icon="/icon.svg"
        title="Disabled"
        handleClick={handleClick}
        disabled
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Disabled/ }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies typography styles when provided", () => {
    render(
      <Button icon="/icon.svg" title="Styled" fontSize={20} fontWeight={600} />,
    );

    expect(screen.getByText("Styled")).toHaveStyle({
      fontSize: "20px",
      fontWeight: 600,
    });
  });

  it("supports native onClick when handleClick is not supplied", () => {
    const onClick = vi.fn();
    render(<Button icon="/icon.svg" title="Native" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /Native/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respects aria-label override from props", () => {
    render(<Button icon="/icon.svg" title="" aria-label="ยืนยัน" />);

    expect(screen.getByRole("button", { name: "ยืนยัน" })).toBeInTheDocument();
  });

  it("falls back to default accessible label when no title provided", () => {
    render(<Button icon="/icon.svg" title="" />);

    expect(screen.getByRole("button", { name: "Button" })).toBeInTheDocument();
  });

  it("merges className and labelClassName props", () => {
    render(
      <Button
        icon="/icon.svg"
        title="Decorated"
        className="extra-class"
        labelClassName="label-extra"
      />,
    );

    expect(screen.getByRole("button", { name: "Decorated" })).toHaveClass(
      "extra-class",
    );
    expect(screen.getByText("Decorated")).toHaveClass("label-extra");
  });

  it("accepts custom label styles", () => {
    render(
      <Button
        icon="/icon.svg"
        title="Styled label"
        labelStyle={{ textTransform: "uppercase" }}
      />,
    );

    expect(screen.getByText("Styled label")).toHaveStyle({
      textTransform: "uppercase",
    });
  });

  it("renders React element icons directly", () => {
    render(
      <Button
        icon={<span data-testid="custom-icon">★</span>}
        title="Element icon"
      />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
