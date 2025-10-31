/**
 * Auth.js v5 Configuration
 * 
 * Prisma adapter for multi-tenant authentication with:
 * - Google OAuth
 * - Credential (username/password) login for admin
 * - Development bypass for testing
 * 
 * @see https://authjs.dev/getting-started/installation
 * @see https://authjs.dev/getting-started/adapters/prisma
 */

import NextAuth, { type DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt", // Use JWT for serverless compatibility
  },
  providers: [
    Google({
      // Prefer new Auth.js env names, fallback to legacy NEXT_* keys
      clientId: process.env.AUTH_GOOGLE_ID || process.env.NEXT_GOOGLE_AUTH_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET || "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
    // Credential provider for admin username/password login
    Credentials({
      id: "credentials",
      name: "Username/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user with password
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          console.log("[AUTH] User not found or no password set")
          return null
        }

        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          console.log("[AUTH] Invalid password")
          return null
        }

        console.log("[AUTH] Credential authentication successful for:", user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    // Development/Testing bypass provider
    // SECURITY: Only enabled when server-only ENABLE_DEV_BYPASS is explicitly set
    Credentials({
      id: "dev-bypass",
      name: "Development Bypass",
      credentials: {},
      async authorize() {
        // SECURITY: Check server-only env variable (not embedded in client bundle)
        // Defaults to disabled for security
        if (process.env.ENABLE_DEV_BYPASS === "true") {
          console.log("[AUTH] Dev bypass provider authenticated user")
          return {
            id: process.env.DEV_USER_ID || "1",
            email: process.env.DEV_USER_EMAIL || "admin@test.com",
            name: process.env.DEV_USER_NAME || "Test Admin",
            role: process.env.DEV_USER_ROLE || "admin",
          }
        }
        console.log("[AUTH] Dev bypass provider rejected - not enabled")
        return null
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn(params) {
      const { account, profile, user } = params
      console.log("[AUTH] Sign in callback - provider:", account?.provider)
      
      // Allow dev bypass provider
      if (account?.provider === "dev-bypass") {
        console.log("[AUTH] Dev bypass authentication")
        return true
      }
      
      // Allow credential provider
      if (account?.provider === "credentials") {
        console.log("[AUTH] Credential authentication")
        return true
      }
      
      // Google OAuth: check if email exists in teacher table OR User table
      if (account?.provider === "google" && profile?.email) {
        console.log("[AUTH] Google provider - checking email:", profile.email)
        
        // Check if user already exists in User table
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        })
        
        if (existingUser) {
          console.log("[AUTH] User found in User table")
          return true
        }
        
        // Check legacy teacher table
        const isTeacherExist = await prisma.teacher.findUnique({
          where: { Email: profile.email },
        })
        
        if (isTeacherExist) {
          console.log("[AUTH] Teacher found in database - creating User record")
          // User will be created by Prisma adapter automatically
          return true
        }
        
        console.log("[AUTH] Email not authorized - access denied")
        return false
      }
      
      return false
    },
    async jwt(params) {
      const { token, user, account } = params
      console.log("[AUTH] JWT callback")
      
      // On sign in, add role to token
      if (user) {
        // For credential/dev-bypass, user.role is already set
        if (user.role) {
          token.role = user.role
          token.id = user.id
          return token
        }
        
        // For Google OAuth, fetch from User table first
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          return token
        }
        
        // Fallback: check legacy teacher table
        if (user.email) {
          const teacher = await prisma.teacher.findUnique({
            where: { Email: user.email },
          })
          if (teacher) {
            token.role = teacher.Role
            token.id = teacher.TeacherID.toString()
          }
        }
      }
      
      return token
    },
    async session(params) {
      const { session, token } = params
      console.log("[AUTH] Session callback")
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
})

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      role?: string
      id?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string | number
  }
}
