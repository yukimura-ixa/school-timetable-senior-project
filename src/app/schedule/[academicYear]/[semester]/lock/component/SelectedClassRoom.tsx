import MiniButton from "@/components/elements/static/MiniButton";
import { Skeleton } from "@mui/material";
import type { subject } from "@/prisma/generated/client";
import { useParams } from "next/navigation";
import React, { Fragment, useMemo } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

// useSemesterSync removed - now using direct route params
import { getGradeLevelsForLockAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import type { teacher } from "@/prisma/generated/client";

type Props = {
  teachers?: teacher[];
  Grade: string[];
  subject?: subject;
  classRoomHandleChange: (value: string) => void;
  required?: boolean;
};

const DEFAULT_CLASS_ROOMS = [
  { Year: 1, rooms: [] as string[] },
  { Year: 2, rooms: [] as string[] },
  { Year: 3, rooms: [] as string[] },
  { Year: 4, rooms: [] as string[] },
  { Year: 5, rooms: [] as string[] },
  { Year: 6, rooms: [] as string[] },
];

function SelectedClassRoom(props: Props) {
  const params = useParams();
  // Extract academicYear and semester from route params
  const academicYear = params.academicYear ? parseInt(params.academicYear as string, 10) : null;
  const semester = params.semester ? parseInt(params.semester as string, 10) : null;
  const teacherIDs = props.teachers?.map((teacher) => teacher.TeacherID) || [];

  const { data, isValidating } = useSWR(
    props.subject && semester && academicYear && teacherIDs.length > 0
      ? [
          "gradelevels-for-lock",
          props.subject.SubjectCode,
          semester,
          academicYear,
          ...teacherIDs,
        ]
      : null,
    async ([, subjectCode, sem, year, ...ids]) => {
      return await getGradeLevelsForLockAction({
        SubjectCode: subjectCode,
        AcademicYear: parseInt(year),
        Semester: `SEMESTER_${sem}` as "SEMESTER_1" | "SEMESTER_2",
        TeacherIDs: ids.map((id) => Number(id)),
      });
    },
    {
      revalidateOnFocus: false,
    },
  );

  const allClassRoom = useMemo(() => {
    if (data && "success" in data && data.success && data.data) {
      const grades = data.data as {
        GradeID: string;
        Year: number;
        Number: number;
      }[];
      const classRoomClassify = (year: number): string[] =>
        grades
          .filter((grade) => grade.Year === year)
          .map((item) => item.GradeID); //เช่น Year === 1 ก็จะเอาแต่ข้อมูลของ ม.1 มา
      return DEFAULT_CLASS_ROOMS.map((item) => ({
        ...item,
        rooms: classRoomClassify(item.Year),
      }));
    }
    return DEFAULT_CLASS_ROOMS.map((item) => ({ ...item, rooms: [] }));
  }, [data]);
  return (
    <>
      <div className="flex flex-col gap-3 justify-between w-full">
        <div className="text-sm flex gap-2 items-center">
          <div className="text-sm flex gap-1">
            <p>เลือกชั้นเรียน</p>
            <p className="text-red-500">*</p>
          </div>
          <p className="text-blue-500">(คลิกที่ชั้นเรียนเพื่อเลือก)</p>
          {props.required ? (
            <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
              <BsInfo className="bg-red-500 rounded-full fill-white" />
              <p className="text-red-500 text-sm">ต้องการ</p>
            </div>
          ) : null}
        </div>
        {[1, 2, 3, 4, 5, 6].map((grade) => (
          <Fragment key={`selectGrade${grade}`}>
            <div className="flex justify-between p-2 w-full h-fit border border-[#EDEEF3] items-center">
              <p>{`ม.${grade}`}</p>
              {/* <CheckBox label={`ม.${grade}`} /> */}
              <div className="flex flex-wrap w-1/2 justify-end gap-3">
                {isValidating ? (
                  <Fragment>
                    <Skeleton variant="rectangular" width={100} height={30} />
                  </Fragment>
                ) : (
                  allClassRoom
                    .filter((item) => item.Year === grade)[0]
                    ?.rooms.map((classroom: string) => (
                      <Fragment key={`ม.${classroom}`}>
                        <MiniButton
                          titleColor={
                            props.Grade.includes(classroom)
                              ? "#008022"
                              : "#222222"
                          }
                          borderColor={
                            props.Grade.includes(classroom)
                              ? "#9fedb3"
                              : "#888888"
                          }
                          buttonColor={
                            props.Grade.includes(classroom)
                              ? "#abffc1"
                              : "#ffffff"
                          }
                          border={true}
                          title={`ม.${grade}/${classroom.substring(2)}`}
                          handleClick={() => {
                            props.classRoomHandleChange(classroom);
                          }}
                          width="fit-content"
                          height={30}
                          isSelected={false}
                          hoverable={false}
                        />
                      </Fragment>
                    ))
                )}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export default SelectedClassRoom;
