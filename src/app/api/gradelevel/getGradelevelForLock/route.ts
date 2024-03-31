import prisma from "@/libs/prisma"
import { semester, type gradelevel } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // localhost:3000/api/gradelevel/getGradelevelForLock?SubjectCode=โครงงาน
    const SubjectCode = request.nextUrl.searchParams.get("SubjectCode")
    const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
    const Semester = semester[request.nextUrl.searchParams.get("Semester")]
    const TeacherIDs = request.nextUrl.searchParams.getAll("TeacherID").map((id) => parseInt(id))
    try {
        const groupby = await prisma.teachers_responsibility.findMany({
            where: {
                AcademicYear: AcademicYear,
                Semester: Semester,
                SubjectCode: SubjectCode,
                TeacherID: {
                    in: TeacherIDs
                }
            },
        })

        const sameGrade = groupby.reduce((acc, curr) => {
            if (!acc[curr.GradeID]) {
                acc[curr.GradeID] = []
            }
            acc[curr.GradeID].push(curr)
            return acc
        }, {})

        const moreThanOne = Object.keys(sameGrade).filter((key) => sameGrade[key].length > 1)

        let searchGradeID = moreThanOne.length > 0 ? moreThanOne : TeacherIDs.length == 1 ? Object.keys(sameGrade) : []

        const data: gradelevel[] = await prisma.gradelevel.findMany({
            where: {
                GradeID: {
                    in: searchGradeID
                }
            }
        })

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json(error.message, { status: 500 })
    }
}