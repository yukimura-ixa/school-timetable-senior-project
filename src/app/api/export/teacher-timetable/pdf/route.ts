import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { normalizeAppRole, isAdminRole } from '@/lib/authz';
import { generateTeacherTimetablePDF } from '@/features/export/pdf/generators/teacher-pdf-generator';
import type { TeacherTimetableData } from '@/features/export/pdf/templates/teacher-timetable-pdf';

/**
 * Teacher Timetable PDF Export API Route
 * 
 * POST /api/export/teacher-timetable/pdf
 * 
 * Admin-only access enforced per new RBAC policy
 * Generates PDF server-side using @react-pdf/renderer
 */
export async function POST(req: NextRequest) {
  // Admin-only RBAC enforcement
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = normalizeAppRole(session?.user?.role);
  
  if (!isAdminRole(userRole)) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const data: TeacherTimetableData = await req.json();
    
    // Validate required fields
    if (!data.teacherId || !data.teacherName || !data.semester || !data.academicYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate PDF
    const pdfBlob = await generateTeacherTimetablePDF(data);
    
    // Convert Blob to Buffer for Response
    const buffer = await pdfBlob.arrayBuffer();
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="teacher-${data.teacherId}-${data.semester}-${data.academicYear}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF Export] Teacher timetable generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
