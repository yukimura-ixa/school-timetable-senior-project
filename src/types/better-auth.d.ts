/**
 * Better Auth Type Definitions
 *
 * Extend better-auth types to include custom fields like 'role'
 */

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role?: string; // Custom field for authorization
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
    session: {
      id: string;
      userId: string;
      token: string;
      expiresAt: Date;
      ipAddress?: string;
      userAgent?: string;
    };
  }
}

export {};
