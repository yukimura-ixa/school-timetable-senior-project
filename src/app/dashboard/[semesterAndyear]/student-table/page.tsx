"use client";
import { useParams } from "next/navigation";
import React, { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useReactToPrint } from "react-to-print";

import { useGradeLevelData } from "@/app/_hooks/gradeLevelData";
import Loading from "@/app/loading";
import PrimaryButton from "@/components/mui/PrimaryButton";
import ErrorState from "@/components/mui/ErrorState";
import { fetcher } from "@/libs/axios";

import TimeSlot from "./component/Timeslot";
import SelectClassRoom from "./component/SelectClassroom";
import { ExportStudentTable } from "./function/ExportStudentTable";
import { createTimeSlotTableData } from "../shared/timeSlot";

const getGradeLabel = (gradeId: string | null) => {
  if (!gradeId) {
    return "";
  }
  const roomNumber = Number.parseInt(gradeId.substring(1), 10);
  return `ม.${gradeId[0]}/${Number.isNaN(roomNumber) ? "" : roomNumber}`;
};

function StudentTablePage() {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split("-");
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

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
      selectedGradeId
        ? `/class?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}&GradeID=${selectedGradeId}`
        : null,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const gradeLevelData = useGradeLevelData();

  const classData = useMemo(() => classDataResponse ?? [], [classDataResponse]);
  const timeSlotData = useMemo(
    () => createTimeSlotTableData(timeslotResponse, classData),
    [timeslotResponse, classData],
  );

  const showLoadingOverlay =
    gradeLevelData.isLoading ||
    isTimeslotLoading ||
    isTimeslotValidating ||
    (selectedGradeId ? isClassLoading || isClassValidating : false);

  const errors: string[] = [];
  if (timeslotError) {
    errors.push("ไม่สามารถโหลดข้อมูลคาบเรียนได้");
  }
  if (classError) {
    errors.push("ไม่สามารถโหลดตารางเรียนของชั้นเรียนที่เลือกได้");
  }

  const ref = useRef<HTMLDivElement>(null);
  const [isPDFExport, setIsPDFExport] = useState(false);

  const generatePDF = useReactToPrint({
    content: () => ref.current,
    copyStyles: true,
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
    !!classError ||
    !!timeslotError;

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
            error={gradeLevelData.error}
          />
          {errors.map((message) => (
            <ErrorState key={message} message={message} />
          ))}
          {selectedGradeId && !classError && !timeslotError && (
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
                  color={"primary"}
                  Icon={undefined}
                  reverseIcon={false}
                  isDisabled={disableExport}
                />
                <PrimaryButton
                  handleClick={handleExportPDF}
                  title={"นำออกเป็น PDF"}
                  color={"primary"}
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
