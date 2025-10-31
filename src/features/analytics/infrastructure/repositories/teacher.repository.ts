/**
 * Teacher Repository
 * Section 2: Teacher Workload Analysis
 *
 * Provides data fetching methods for teacher workload metrics and department analysis.
 */

import prisma from '@/lib/prisma';
import type { TeacherWorkload, DepartmentWorkload } from '../../domain/types/analytics.types';
import { parseConfigId, getWorkloadStatus, calculateDepartmentWorkload } from '../../domain/services/calculation.service';

/**
 * Get workload data for all teachers
 */
async function getTeacherWorkloads(configId: string): Promise<TeacherWorkload[]> {
  const config = parseConfigId(configId);
  
  // Get timeslot IDs for this semester
  const timeslots = await prisma.timeslot.findMany({
    where: {
      AcademicYear: config.academicYear,
      Semester: config.semester,
    },
    select: {
      TimeslotID: true,
    },
  });
  
  const timeslotIds = timeslots.map(t => t.TimeslotID);
  const totalAvailableHours = timeslots.length;
  
  // Get all class schedules with teacher responsibilities for this semester
  const schedules = await prisma.class_schedule.findMany({
    where: {
      TimeslotID: {
        in: timeslotIds,
      },
    },
    select: {
      ClassID: true,
      GradeID: true,
      TimeslotID: true,
      teachers_responsibility: {
        include: {
          teacher: true,
        },
      },
    },
  });
  
  // Aggregate by teacher
  const teacherMap = new Map<number, {
    teacher: typeof schedules[0]['teachers_responsibility'][0]['teacher'];
    hours: Set<string>;
    grades: Set<string>;
  }>();
  
  schedules.forEach(schedule => {
    schedule.teachers_responsibility.forEach(resp => {
      if (!teacherMap.has(resp.TeacherID)) {
        teacherMap.set(resp.TeacherID, {
          teacher: resp.teacher,
          hours: new Set(),
          grades: new Set(),
        });
      }
      const data = teacherMap.get(resp.TeacherID);
      if (data) {
        data.hours.add(schedule.ClassID); // Each ClassID represents a period
        data.grades.add(schedule.GradeID);
      }
    });
  });
  
  // Transform to workload data
  return Array.from(teacherMap.entries())
    .map(([teacherId, data]) => {
      const totalHours = data.hours.size;
      const classCount = data.grades.size;
      const utilizationRate = totalAvailableHours > 0 
        ? (totalHours / totalAvailableHours) * 100 
        : 0;
      
      return {
        teacherId,
        teacherName: `${data.teacher.Prefix}${data.teacher.Firstname} ${data.teacher.Lastname}`,
        teacherPrefix: data.teacher.Prefix,
        teacherFirstname: data.teacher.Firstname,
        teacherLastname: data.teacher.Lastname,
        department: data.teacher.Department,
        totalHours,
        classCount,
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        workloadStatus: getWorkloadStatus(totalHours),
      };
    })
    .sort((a, b) => a.teacherFirstname.localeCompare(b.teacherFirstname));
}

/**
 * Get workload summary by department
 */
async function getDepartmentWorkloads(configId: string): Promise<DepartmentWorkload[]> {
  const teacherWorkloads = await getTeacherWorkloads(configId);
  
  // Group by department
  const departmentMap = new Map<string, TeacherWorkload[]>();
  teacherWorkloads.forEach(tw => {
    if (!departmentMap.has(tw.department)) {
      departmentMap.set(tw.department, []);
    }
    const dept = departmentMap.get(tw.department);
    if (dept) {
      dept.push(tw);
    }
  });
  
  // Calculate department workload
  return Array.from(departmentMap.entries()).map(([dept, teachers]) =>
    calculateDepartmentWorkload(teachers, dept)
  );
}

/**
 * Get workload data for a specific teacher
 */
async function getTeacherWorkloadById(
  configId: string,
  teacherId: number
): Promise<TeacherWorkload | null> {
  const workloads = await getTeacherWorkloads(configId);
  return workloads.find(w => w.teacherId === teacherId) || null;
}

/**
 * Get teachers filtered by workload status
 */
async function getTeachersByWorkloadStatus(
  configId: string,
  status: TeacherWorkload['workloadStatus']
): Promise<TeacherWorkload[]> {
  const workloads = await getTeacherWorkloads(configId);
  return workloads.filter(w => w.workloadStatus === status);
}

/**
 * Get top N teachers by total hours (descending)
 */
async function getTopTeachersByHours(
  configId: string,
  limit = 10
): Promise<TeacherWorkload[]> {
  const workloads = await getTeacherWorkloads(configId);
  return workloads
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit);
}

export const teacherRepository = {
  getTeacherWorkloads,
  getDepartmentWorkloads,
  getTeacherWorkloadById,
  getTeachersByWorkloadStatus,
  getTopTeachersByHours,
};
