import prisma from "@/libs/prisma"
import { type subject } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const data: subject[] = await prisma.subject.findMany({
      where: {
        ProgramID: null,
      },
      orderBy: {
        SubjectCode: "asc",
      },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.log(error)
    return NextResponse.json(error.message, { status: 500 })
  }
}