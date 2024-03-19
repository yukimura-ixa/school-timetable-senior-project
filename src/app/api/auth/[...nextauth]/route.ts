import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import prisma from "@/libs/prisma"

export const authOptions = {
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(),
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ account, profile }) {
      console.log("Sign in callback")
      if (account.provider === "google") {
        console.log("Google provider")
        const isTeacherExist = await prisma.teacher.findUnique({
          where: {
            Email: profile.email,
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
    async jwt({ token }) {
      console.log("JWT callback")
      const teacher = await prisma.teacher.findUnique({
        where: {
          Email: token.email,
        },
      })
      if (teacher) {
        token.role = teacher.Role
        token.id = teacher.TeacherID
        token.name =
          teacher.Prefix + teacher.Firstname + " " + teacher.Lastname
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session Callback")
      if (session.user) {
        session.user = {
          ...session.user,
          role: token.role,
        }
      }
      // console.log(session)
      return session
    },
  },
}

const handler = NextAuth({
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: FirestoreAdapter(),
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ account, profile }) {
      console.log("Sign in callback")
      if (account.provider === "google") {
        console.log("Google provider")
        const isTeacherExist = await prisma.teacher.findUnique({
          where: {
            Email: profile.email,
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
    async jwt({ token }) {
      console.log("JWT callback")
      const teacher = await prisma.teacher.findUnique({
        where: {
          Email: token.email,
        },
      })
      if (teacher) {
        token.role = teacher.Role
        token.id = teacher.TeacherID
        token.name =
          teacher.Prefix + teacher.Firstname + " " + teacher.Lastname
      }
      return token
    },
    async session({ session, token }) {
      console.log("Session Callback")
      if (session.user) {
        session.user = {
          ...session.user,
          role: token.role,
        }
      }
      // console.log(session)
      return session
    },
  },
})

export { handler as GET, handler as POST }
