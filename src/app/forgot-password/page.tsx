import { redirect } from "next/navigation";

// Email system is disabled app-wide — the reset flow can't deliver, so the
// page is not reachable. Route stays registered so the existing client
// component and metadata file remain valid imports; restore by reverting
// this commit when email works.
export default function ForgotPasswordDisabledPage() {
  redirect("/signin");
}
