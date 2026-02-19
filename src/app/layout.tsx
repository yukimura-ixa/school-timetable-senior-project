import "./globals.css";
import Navbar from "@/components/templates/Navbar";
import Content from "@/components/templates/Content";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import SnackbarProvider from "@/components/elements/snackbar/SnackbarProvider";
import { ErrorBoundary } from "@/components/error";
import { Sarabun, Inter } from "next/font/google"; // [NEW] Add Inter
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-sarabun",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className={`font-sans min-h-screen bg-ds-slate-50`}>
        <Suspense fallback={<RootLayoutFallback />}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
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
  );
}

function RootLayoutFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">กำลังโหลด…</p>
    </div>
  );
}
