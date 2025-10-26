import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/libs/prisma"

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    Google({
      clientId: process.env.NEXT_GOOGLE_AUTH_CLIENT_ID || "",
      clientSecret: process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET || "",
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
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
    colorScheme: "light" as const,
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log("[AUTH] Sign in callback - provider:", account?.provider)
      
      // Allow dev bypass provider
      if (account?.provider === "dev-bypass") {
        console.log("[AUTH] Dev bypass authentication")
        return true
      }
      
      if (account?.provider === "google" && profile?.email) {
        console.log("[AUTH] Google provider - checking email:", profile.email)
        const isTeacherExist = await prisma.teacher.findUnique({
          where: {
            Email: profile.email,
          },
        })
        if (isTeacherExist) {
          console.log("[AUTH] Teacher found in database")
          return true
        }
        console.log("[AUTH] Teacher not found - access denied")
        return false
      }
      return false
    },
    async jwt({ token, user }) {
      console.log("[AUTH] JWT callback")
      
      // For dev bypass, use the role from user object
      if (user?.role) {
        token.role = user.role
        token.id = user.id
        token.name = user.name
        return token
      }
      
      // For Google auth, fetch teacher from database
      if (token.email) {
        const teacher = await prisma.teacher.findUnique({
          where: {
            Email: token.email,
          },
        })
        if (teacher) {
          token.role = teacher.Role
          token.id = teacher.TeacherID
          token.name = teacher.Role === "teacher" 
            ? teacher.Prefix + teacher.Firstname + " " + teacher.Lastname 
            : token.name
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("[AUTH] Session callback")
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      id?: string
    }
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
