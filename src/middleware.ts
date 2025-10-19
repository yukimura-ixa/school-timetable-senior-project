import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    if (
      token?.role === "teacher" &&
      !(req.nextUrl.pathname.endsWith("/teacher-table") || req.nextUrl.pathname.endsWith("/student-table"))
    ) {
      const url = new URL("/dashboard/select-semester", req.nextUrl).href;
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow bypass in development mode
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          return true;
        }

        if (token?.role === "admin") return true;

        if (token?.role === "student" && !req.nextUrl.pathname.endsWith("student-table"))
          return false;
        
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/schedule/:path*",
    "/management/:path*",
    "/dashboard/:path/all-program",
    "/dashboard/:path/all-timeslot",
    "/dashboard/:path/teacher-table",
  ],
};
