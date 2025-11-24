import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in session.user types
   */
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT token types
   */
  interface JWT {
    role?: string;
    id?: string | number;
  }
}
