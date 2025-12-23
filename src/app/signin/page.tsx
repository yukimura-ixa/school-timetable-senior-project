import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignInPageClient from "./SignInPageClient";

/**
 * SignIn Page - Server Component
 *
 * Handles server-side session validation and redirects.
 * Renders the client component for the actual UI.
 */
export default async function SignInPage() {
  // Server-side session check using better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect authenticated users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  // Render signin UI for unauthenticated users
  return <SignInPageClient />;
}
