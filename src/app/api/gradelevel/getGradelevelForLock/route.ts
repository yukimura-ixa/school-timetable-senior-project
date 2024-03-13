import prisma from "@/libs/prisma"
import type { gradelevel } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    // localhost:3000/api/gradelevel/getGradelevelForLock?SubjectCode=โครงงาน
    try {
        const SubjectCode = request.nextUrl.searchParams.get("SubjectCode")
        const data: gradelevel[] = await prisma.gradelevel.findMany({
            where: {
                program: {
                    some: {
                        subject: {
                            some: {
                                SubjectCode: SubjectCode
                            }
                        }
                    }
                }
            },
            orderBy: {
                GradeID: "asc",
            },
        })
        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json(error.message, { status: 500 })
    }
}