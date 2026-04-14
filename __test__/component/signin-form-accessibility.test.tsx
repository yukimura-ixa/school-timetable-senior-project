import { describe, expect, it, vi } from "vitest";
/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import SignInForm from "@/app/signin/SignInForm";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe("SignInForm accessibility", () => {
  it("provides browser autocomplete hints for email and password fields", () => {
    render(<SignInForm />);

    const emailInput = screen.getByLabelText("อีเมล");
    const passwordInput = screen.getByLabelText("รหัสผ่าน");

    expect(emailInput).toHaveAttribute("autocomplete", "email");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });
});
