import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Container, Stack } from "@mui/material";
import WelcomePanel from "./WelcomePanel";
import SignInForm from "./SignInForm";

/**
 * SignIn Page - Server Component
 *
 * Main signin page that performs server-side session validation.
 * If user is already authenticated, redirects to dashboard immediately.
 * Otherwise, renders the signin UI composed of WelcomePanel and SignInForm.
 *
 * This is an async Server Component following Next.js 16 best practices.
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
  return (
    <Container
      maxWidth="lg"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={4}
        sx={{ width: "100%" }}
      >
        <WelcomePanel />
        <SignInForm />
      </Stack>
    </Container>
  );
}
