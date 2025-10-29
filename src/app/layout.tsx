import "./globals.css";
import Navbar from "@/components/templates/Navbar";
import Content from "@/components/templates/Content";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import SnackbarProvider from "@/components/elements/snackbar/SnackbarProvider";
import SessionProvider from "@/components/elements/nextauth/SessionProvider";
import { ErrorBoundary } from "@/components/error";
import { auth } from "@/libs/auth";
import { Sarabun } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sarabun",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className={`font-sans min-h-screen bg-gray-50`}>
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
      </body>
    </html>
  );
}
