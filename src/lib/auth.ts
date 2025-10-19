import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/libs/prisma"

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
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
    CredentialsProvider({
      id: "dev-bypass",
      name: "Development Bypass",
      credentials: {},
      async authorize() {
        // Only allow bypass in development mode
        if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
          return {
            id: process.env.DEV_USER_ID || "1",
            email: process.env.DEV_USER_EMAIL || "admin@test.com",
            name: process.env.DEV_USER_NAME || "Test Admin",
            role: process.env.DEV_USER_ROLE || "admin",
          }
        }
        return null
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ account, profile }) {
      console.log("Sign in callback")
      
      // Allow dev bypass provider
      if (account?.provider === "dev-bypass") {
        console.log("Dev bypass authentication")
        return true
      }
      
      if (account?.provider === "google") {
        console.log("Google provider")
        const isTeacherExist = await prisma.teacher.findUnique({
          where: {
            Email: profile?.email,
          },
        })
        if (isTeacherExist) {
          console.log("Teacher found")
          return true
        }
        console.log("Teacher not found")
        return false
      }
      return false
    },
    async jwt({ token, user }) {
      console.log("JWT callback")
      
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
      console.log("Session Callback")
      if (session.user) {
        session.user = {
          ...session.user,
          role: token.role as string,
        }
      }
      return session
    },
  },
}
