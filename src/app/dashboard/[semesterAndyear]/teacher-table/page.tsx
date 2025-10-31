"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useReactToPrint } from "react-to-print";

import Loading from "@/app/loading";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import ErrorState from "@/components/elements/static/ErrorState";
import { useSemesterSync } from "@/hooks";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";
import { getTeacherByIdAction } from "@/features/teacher/application/actions/teacher.actions";

import TimeSlot from "./component/Timeslot";
import SelectTeacher from "./component/SelectTeacher";
import { ExportTeacherTable } from "../all-timeslot/functions/ExportTeacherTable";
import { createTimeSlotTableData } from "../shared/timeSlot";

interface Teacher {
  Prefix?: string;
  Firstname?: string;
  Lastname?: string;
}

const formatTeacherName = (teacher?: Teacher) => {
  if (!teacher) {
    return "";
  }

  const prefix = teacher.Prefix ?? "";
  const firstname = teacher.Firstname ?? "";
  const lastname = teacher.Lastname ?? "";

  return `${prefix}${firstname}${firstname && lastname ? " " : ""}${lastname}`.trim();
};

function TeacherTablePage() {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const {
    data: timeslotResponse,
    error: timeslotError,
    isLoading: isTimeslotLoading,
    isValidating: isTimeslotValidating,
  } = useSWR(
    semester && academicYear
      ? ['timeslots-by-term', academicYear, semester]
      : null,
    async ([, year, sem]) => {
      return await getTimeslotsByTermAction({
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    { revalidateOnFocus: false },
  );

  const {
    data: classDataResponse,
    error: classError,
    isLoading: isClassLoading,
    isValidating: isClassValidating,
  } = useSWR(
    selectedTeacherId && semester && academicYear
      ? ['class-schedules-teacher', selectedTeacherId, academicYear, semester]
      : null,
    async ([, teacherId, year, sem]) => {
      return await getClassSchedulesAction({
        TeacherID: teacherId,
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const {
    data: teacherResponse,
    error: teacherError,
    isLoading: isTeacherLoading,
    isValidating: isTeacherValidating,
  } = useSWR(
    selectedTeacherId ? ['teacher-by-id', selectedTeacherId] : null,
    async ([, teacherId]) => {
      return await getTeacherByIdAction({ TeacherID: teacherId });
    },
    {
      revalidateOnFocus: false,
    },
  );

  const classData = useMemo(() => {
    if (classDataResponse && 'success' in classDataResponse && classDataResponse.success && classDataResponse.data) {
      return classDataResponse.data;
    }
    return [];
  }, [classDataResponse]);
  
  const timeSlotData = useMemo(() => {
    if (timeslotResponse && 'success' in timeslotResponse && timeslotResponse.success && timeslotResponse.data) {
      return createTimeSlotTableData(timeslotResponse.data, classData);
    }
    return { timeslots: [], days: [], breakSlots: [] };
  }, [timeslotResponse, classData]);

  const showLoadingOverlay =
    isTimeslotLoading ||
    isTimeslotValidating ||
    (selectedTeacherId
      ? isClassLoading ||
        isClassValidating ||
        isTeacherLoading ||
        isTeacherValidating
      : false);

  const errors: string[] = [];
  if (timeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (classError && selectedTeacherId) {
    errors.push("ไม่สามารถโหลดตารางสอนของครูที่เลือกได้");
  }
  if (teacherError && selectedTeacherId) {
    errors.push("ไม่สามารถโหลดข้อมูลครูที่เลือกได้");
  }

  const ref = useRef<HTMLDivElement>(null);
  const [isPDFExport, setIsPDFExport] = useState(false);

  const teacherName = useMemo(() => {
    if (teacherResponse && 'success' in teacherResponse && teacherResponse.success && teacherResponse.data) {
      return formatTeacherName(teacherResponse.data);
    }
    return "";
  }, [teacherResponse]);

  const generatePDF = useReactToPrint({
    contentRef: ref,
    documentTitle: `ตารางสอน${teacherName ? teacherName : ""} ${semester}-${academicYear}`,
  });

  const handleExportPDF = () => {
    setIsPDFExport(true);
    setTimeout(() => {
      generatePDF();
      setIsPDFExport(false);
    }, 1);
  };

  const handleSelectTeacher = (teacherId: number | null) => {
    setSelectedTeacherId(teacherId);
  };

  const disableExport =
    isClassLoading ||
    isClassValidating ||
    isTeacherLoading ||
    isTeacherValidating ||
    !selectedTeacherId ||
    !!classError ||
    !!timeslotError ||
    !!teacherError;

  return (
    <div className="flex flex-col gap-3">
      {showLoadingOverlay ? (
        <Loading />
      ) : (
        <>
          <SelectTeacher
            setTeacherID={handleSelectTeacher}
            currentTeacher={teacherResponse}
          />
          {errors.map((message) => (
            <ErrorState key={message} message={message} />
          ))}
          {selectedTeacherId &&
            teacherResponse &&
            !classError &&
            !timeslotError &&
            !teacherError && (
              <>
                <div className="flex w-full justify-end gap-3">
                  <PrimaryButton
                    handleClick={() => {
                      if (teacherResponse && 'success' in teacherResponse && teacherResponse.success && teacherResponse.data) {
                        ExportTeacherTable(
                          timeSlotData,
                          [teacherResponse.data],
                          classData,
                          semester,
                          academicYear,
                        );
                      }
                    }}
                    title={"นำออกเป็น Excel"}
                    color={"success"}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={disableExport}
                  />
                  <PrimaryButton
                    handleClick={handleExportPDF}
                    title={"นำออกเป็น PDF"}
                    color={"success"}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={disableExport}
                  />
                </div>
                <TimeSlot timeSlotData={timeSlotData} />
                <div
                  ref={ref}
                  className="printFont mt-5 flex flex-col items-center justify-center p-10"
                  style={{ display: isPDFExport ? "flex" : "none" }}
                >
                  <div className="mb-8 flex gap-10">
                    <p>ตารางสอน {teacherName}</p>
                    <p>ภาคเรียนที่ {`${semester}/${academicYear}`}</p>
                  </div>
                  <TimeSlot timeSlotData={timeSlotData} />
                  <div className="mt-8 flex gap-2">
                    <p>ลงชื่อ..............................รองผอ.วิชาการ</p>
                    <p>ลงชื่อ..............................ผู้อำนวยการ</p>
                  </div>
                </div>
              </>
            )}
        </>
      )}
    </div>
  );
}

export default TeacherTablePage;
