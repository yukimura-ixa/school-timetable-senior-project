import { semester } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
    try {
        const AcademicYear = parseInt(request.nextUrl.searchParams.get("AcademicYear"))
        const Semester = request.nextUrl.searchParams.get("Semester")
        const data = await prisma.table_config.findFirst({
            where: {
                AcademicYear: AcademicYear,
                Semester: semester[Semester]
            }
        })
        return NextResponse.json(data)

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error }, { status: 500 })
    }
}