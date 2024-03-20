/* eslint-disable react/no-children-prop */
import "./globals.css";
import Navbar from "@/components/templates/Navbar";
import Content from "@/components/templates/Content";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import SnackbarProvider from "@/components/elements/snackbar/SnackbarProvider";
import SessionProvider from "@/components/elements/nextauth/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Sarabun } from "next/font/google";

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
  const session = await getServerSession(authOptions);
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className={`overflow-scroll xl:overflow-x-hidden`}>
        <SessionProvider session={session}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <SnackbarProvider autoHideDuration={4000} maxSnack={1}>
                <Navbar />
                <main className="flex justify-center w-[1280px] xl:w-full h-auto">
                  <Content children={children} />
                </main>
              </SnackbarProvider>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
