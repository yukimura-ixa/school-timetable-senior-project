import "./globals.css";
import Navbar from "@/components/templates/Navbar";
import Content from "@/components/templates/Content";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import SnackbarProvider from "@/components/elements/snackbar/SnackbarProvider";
import SessionProvider from "@/components/elements/nextauth/SessionProvider";
import { ErrorBoundary } from "@/components/error";
import { auth } from "@/lib/auth";
import { Sarabun } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sarabun",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className={`font-sans min-h-screen bg-gray-50`}>
        <Suspense fallback={<RootLayoutFallback />}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

async function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawSession = await auth();

  const session =
    rawSession && rawSession.user
      ? {
          ...rawSession,
          user: {
            id: rawSession.user.id,
            name: rawSession.user.name,
            role: rawSession.user.role,
            image: rawSession.user.image,
          },
        }
      : rawSession;

  return (
    <SessionProvider session={session}>
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <SnackbarProvider autoHideDuration={4000} maxSnack={1}>
            <ErrorBoundary>
              <Navbar />
              <div className="flex justify-center w-full h-auto">
                <Content>{children}</Content>
                <SpeedInsights />
              </div>
            </ErrorBoundary>
          </SnackbarProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}

function RootLayoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">กำลังโหลด…</p>
    </div>
  );
}
