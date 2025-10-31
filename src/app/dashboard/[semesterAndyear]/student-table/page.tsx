"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useReactToPrint } from "react-to-print";

import { useGradeLevels, useSemesterSync } from "@/hooks";
import Loading from "@/app/loading";
import PrimaryButton from "@/components/mui/PrimaryButton";
import ErrorState from "@/components/mui/ErrorState";
import { getTimeslotsByTermAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { getClassSchedulesAction } from "@/features/class/application/actions/class.actions";

import TimeSlot from "./component/Timeslot";
import SelectClassRoom from "./component/SelectClassroom";
import { ExportStudentTable } from "./function/ExportStudentTable";
import { createTimeSlotTableData, type TimeSlotTableData } from "../shared/timeSlot";
import type { ScheduleEntry } from "../shared/timeSlot";
import type { ActionResult } from "@/shared/lib/action-wrapper";

const getGradeLabel = (gradeId: string | null) => {
  if (!gradeId) {
    return "";
  }
  const roomNumber = Number.parseInt(gradeId.substring(1), 10);
  return `ม.${gradeId[0]}/${Number.isNaN(roomNumber) ? "" : roomNumber}`;
};

function StudentTablePage() {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear as string);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  const {
    data: timeslotResponse,
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
    isLoading: isClassLoading,
    isValidating: isClassValidating,
  } = useSWR(
    selectedGradeId && semester && academicYear
      ? ['class-schedules-grade', selectedGradeId, academicYear, semester]
      : null,
    async ([, gradeId, year, sem]) => {
      return await getClassSchedulesAction({
        GradeID: gradeId,
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as 'SEMESTER_1' | 'SEMESTER_2',
      });
    },
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const gradeLevelData = useGradeLevels();

  const hasTimeslotError = !timeslotResponse || ('success' in (timeslotResponse as object) && !(timeslotResponse as ActionResult<unknown>).success);
  const hasClassError = classDataResponse && 'success' in (classDataResponse as object) && !(classDataResponse as ActionResult<unknown>).success;

  const classData = useMemo((): ScheduleEntry[] => {
    const response = classDataResponse as ActionResult<ScheduleEntry[]> | undefined;
    if (!response || !response.success || !response.data) {
      return [];
    }
    return response.data;
  }, [classDataResponse]);
  
  const timeSlotData: TimeSlotTableData = useMemo(() => {
    const response = timeslotResponse;
    const timeslots = (response && typeof response === 'object' && 'success' in response && response.success && 'data' in response && response.data) 
      ? response.data 
      : undefined;
    return createTimeSlotTableData(timeslots, classData);
  }, [timeslotResponse, classData]);

  const showLoadingOverlay =
    gradeLevelData.isLoading ||
    isTimeslotLoading ||
    isTimeslotValidating ||
    (selectedGradeId ? isClassLoading || isClassValidating : false);

  const errors: string[] = [];
  if (hasTimeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (hasClassError) {
    errors.push("ไม่สามารถโหลดตารางเรียนของชั้นเรียนที่เลือกได้");
  }

  const ref = useRef<HTMLDivElement>(null);
  const [isPDFExport, setIsPDFExport] = useState(false);

  const generatePDF = useReactToPrint({
    contentRef: ref,
    documentTitle: `ตารางเรียน${selectedGradeId ?? ""} ${semester}-${academicYear}`,
  });

  const handleExportPDF = () => {
    setIsPDFExport(true);
    setTimeout(() => {
      generatePDF();
      setIsPDFExport(false);
    }, 1);
  };

  const handleSelectGrade = (gradeId: string | null) => {
    setSelectedGradeId(gradeId);
  };

  const selectedGradeInfo = selectedGradeId
    ? gradeLevelData.data.filter((item) => item.GradeID === selectedGradeId)
    : [];

  const disableExport =
    isClassLoading ||
    isClassValidating ||
    !selectedGradeId ||
    hasClassError ||
    hasTimeslotError;

  return (
    <div className="flex flex-col gap-3">
      {showLoadingOverlay ? (
        <Loading />
      ) : (
        <>
          <SelectClassRoom
            setGradeID={handleSelectGrade}
            currentGrade={selectedGradeId}
            gradeLevels={gradeLevelData.data}
            isLoading={gradeLevelData.isLoading}
            error={gradeLevelData.error as Error | undefined}
          />
          {errors.map((message) => (
            <ErrorState key={message} message={message} />
          ))}
          {selectedGradeId && !hasClassError && !hasTimeslotError && (
            <>
              <div className="flex w-full justify-end gap-3">
                <PrimaryButton
                  handleClick={() =>
                    ExportStudentTable(
                      timeSlotData,
                      selectedGradeInfo,
                      classData,
                      semester,
                      academicYear,
                    )
                  }
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
              <TimeSlot
                searchGradeID={selectedGradeId}
                timeSlotData={timeSlotData}
              />
              <div
                ref={ref}
                className="printFont mt-5 flex flex-col items-center justify-center p-10"
                style={{ display: isPDFExport ? "flex" : "none" }}
              >
                <div className="printFont mb-8 flex gap-10">
                  <p>ตารางเรียน {getGradeLabel(selectedGradeId)}</p>
                  <p>ภาคเรียนที่ {`${semester}/${academicYear}`}</p>
                </div>
                <TimeSlot
                  searchGradeID={selectedGradeId}
                  timeSlotData={timeSlotData}
                />
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

export default StudentTablePage;
