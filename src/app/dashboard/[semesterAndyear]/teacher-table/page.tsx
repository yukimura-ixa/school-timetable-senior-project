"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useReactToPrint } from "react-to-print";

import Loading from "@/app/loading";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import ErrorState from "@/components/elements/static/ErrorState";
import { fetcher } from "@/libs/axios";

import TimeSlot from "./component/Timeslot";
import SelectTeacher from "./component/SelectTeacher";
import { ExportTeacherTable } from "../all-timeslot/functions/ExportTeacherTable";
import { createTimeSlotTableData } from "../shared/timeSlot";

const formatTeacherName = (teacher?: Record<string, any>) => {
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
  const [semester, academicYear] = (params.semesterAndyear as string).split("-");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  const {
    data: timeslotResponse,
    error: timeslotError,
    isLoading: isTimeslotLoading,
    isValidating: isTimeslotValidating,
  } = useSWR(
    `/timeslot?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const {
    data: classDataResponse,
    error: classError,
    isLoading: isClassLoading,
    isValidating: isClassValidating,
  } = useSWR(
    () =>
      selectedTeacherId
        ? `/class?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}&TeacherID=${selectedTeacherId}`
        : null,
    fetcher,
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
    () =>
      selectedTeacherId ? `/teacher?TeacherID=${selectedTeacherId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const classData = useMemo(() => classDataResponse ?? [], [classDataResponse]);
  const timeSlotData = useMemo(
    () => createTimeSlotTableData(timeslotResponse, classData),
    [timeslotResponse, classData],
  );

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

  const teacherName = formatTeacherName(teacherResponse);

  const generatePDF = useReactToPrint({
    content: () => ref.current,
    copyStyles: true,
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
                    handleClick={() =>
                      ExportTeacherTable(
                        timeSlotData,
                        [teacherResponse],
                        classData,
                        semester,
                        academicYear,
                      )
                    }
                    title={"นำออกเป็น Excel"}
                    color={""}
                    Icon={undefined}
                    reverseIcon={false}
                    isDisabled={disableExport}
                  />
                  <PrimaryButton
                    handleClick={handleExportPDF}
                    title={"นำออกเป็น PDF"}
                    color={""}
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
