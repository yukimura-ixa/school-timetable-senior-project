import MiniButton from "@/components/elements/static/MiniButton";
import { fetcher } from "@/libs/axios";
import { CircularProgress, Skeleton } from "@mui/material";
import { subject } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";
import useSWR from "swr";

type Props = {
  teachers: any;
  Grade: any;
  subject: subject;
  classRoomHandleChange: any;
  required: boolean;
};

function SelectedClassRoom(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]; //from "1-2566" to ["1", "2566"]
  const teacherIDs = props.teachers.map((teacher) => teacher.TeacherID);
  const teacherIDpath = teacherIDs.join("&TeacherID=");

  const { data, isLoading, error, isValidating } = useSWR(
    props.subject
      ? `/gradelevel/getGradelevelForLock?SubjectCode=` +
          props.subject.SubjectCode +
          `&AcademicYear=` +
          academicYear +
          `&Semester=SEMESTER_` +
          semester +
          `&TeacherID=` +
          teacherIDpath
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const [allClassRoom, setAllClassRoom] = useState([
    { Year: 1, rooms: [] },
    { Year: 2, rooms: [] },
    { Year: 3, rooms: [] },
    { Year: 4, rooms: [] },
    { Year: 5, rooms: [] },
    { Year: 6, rooms: [] },
  ]);
  useEffect(() => {
    if (data) {
      console.log(data);
      const ClassRoomClassify = (year: number) => {
        //function สำหรับจำแนกชั้นเรียนสำหรับนำข้อมูลไปใช้งานเพื่อแสดงผลบนหน้าเว็บโดยเฉพาะ
        //รูปแบบข้อมูล จะมาประมาณนี้ (responsibilityData.data variable)
        //{GradeID: '101', ...}
        //{GradeID: '101', ...}
        //{GradeID: '102', ...}
        const filterResData = data
          .filter((data) => data.Year == year)
          .map((item) => item.GradeID); //เช่น Year == 1 ก็จะเอาแต่ข้อมูลของ ม.1 มา
        return filterResData;
      };
      setAllClassRoom((prev) =>
        prev.map((item) => ({
          ...item,
          rooms: ClassRoomClassify(item.Year),
        })),
      );
    }
  }, [isValidating, data]);
  return (
    <>
      <div className="flex flex-col gap-3 justify-between w-full">
        <div className="text-sm flex gap-2 items-center">
          <div className="text-sm flex gap-1">
            <p onClick={() => console.log(allClassRoom)}>เลือกชั้นเรียน</p>
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
                    .filter((item) => item.Year == grade)[0]
                    .rooms.map((classroom: any) => (
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
