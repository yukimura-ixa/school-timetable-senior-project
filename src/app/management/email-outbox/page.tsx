import { redirect } from "next/navigation";

// Email system is disabled app-wide. Route stays registered so stale
// bookmarks/links don't 404 — they bounce back to the management index.
// Restore the full page by reverting this commit when email is re-enabled.
export default function EmailOutboxDisabledPage() {
  redirect("/management");
}
