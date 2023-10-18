"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { IoIosArrowDown, IoMdAdd, IoMdAddCircle } from "react-icons/io";
import SelectClassRoomModal from "../component/SelectClassRoomModal";
import AddSubjectModal from "../component/AddSubjectModal";
import axios from "axios";
type Props = {
  backPage: Function;
};

const ClassroomResponsibility = (props: Props) => {
  const [data, setData] = useState({
    Teacher: {
      TeacherID: 3,
      Prefix: "นาง",
      Firstname: "สุภาพรณ์",
      Lastname: "วงศ์ทรรศนกุล",
      Department: "ภาษาไทย",
    },
    Grade: [
      {
        Year: 1,
        ClassRooms: [
          {
            GradeID: 101,
            Subjects: [
              {
                SubjectID: 5,
                SubjectCode: "ท21102",
                SubjectName: "ภาษาไทยพื้นฐาน",
                TeachHour: 4,
              },
              {
                SubjectID: 65,
                SubjectCode: "ก22901",
                SubjectName: "แนะแนว",
                TeachHour: 2,
              },
            ],
          },
          {
            GradeID: 105,
            Subjects: [
              {
                SubjectID: 5,
                SubjectCode: "ท21102",
                SubjectName: "ภาษาไทยพื้นฐาน",
                TeachHour: 3,
              },
              {
                SubjectID: 65,
                SubjectCode: "ก22901",
                SubjectName: "แนะแนว",
                TeachHour: 1,
              },
            ],
          },
        ],
      },
      {
        Year: 2,
        ClassRooms: [
          {
            GradeID: 101,
            Subjects: [
              {
                SubjectID: 5,
                SubjectCode: "ท21102",
                SubjectName: "ภาษาไทยพื้นฐาน",
                TeachHour: 4,
              },
              {
                SubjectID: 65,
                SubjectCode: "ก22901",
                SubjectName: "แนะแนว",
                TeachHour: 2,
              },
            ],
          },
          {
            GradeID: 103,
            Subjects: [
              {
                SubjectID: 5,
                SubjectCode: "ท21102",
                SubjectName: "ภาษาไทยพื้นฐาน",
                TeachHour: 3,
              },
              {
                SubjectID: 65,
                SubjectCode: "ก22901",
                SubjectName: "แนะแนว",
                TeachHour: 1,
              },
            ],
          },
        ],
      },
      {
        Year: 3,
        ClassRooms: [],
      },
      {
        Year: 4,
        ClassRooms: [
          {
            GradeID: 404,
            Subjects: [],
          },
          {
            GradeID: 405,
            Subjects: [],
          },
        ],
      },
      {
        Year: 5,
        ClassRooms: [],
      },
      {
        Year: 6,
        ClassRooms: [],
      },
    ],
  });
  const router = useRouter();
  const [cardHidden, setCardHidden] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [classRoomModalActive, setClassRoomModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  const [addSubjectModalActive, setAddSubjectModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  // const [selectedClass, setSelectedClass] = useState<number>(2); //เซ็ทไว้ดึงข้อมูลห้องเรียนทั้งหมดว่ามีกี่ห้อง -> ส่งไปที่ Modal
  const [classRoomList, setClassRoomList] = useState<number[]>([]); //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
  const changeClassRoomList = (item: number[]) => {
    setClassRoomList(() => item);
    setClassRoomModalActive(false);
  };
  const hiddenCard = (index: number) => {
    if (cardHidden.includes(index)) {
      setCardHidden(() => cardHidden.filter((item) => item !== index));
    } else {
      setCardHidden(() => [...cardHidden, index]);
    }
  };
  const addSubjectToClassRoom = (subj: any) => {
    //เพิ่มรายวิชาจาก modal
    let newSubject = [
      ...data.Grade.filter(
        (item) => item.Year == classRoomForAddSubj.Year
      )[0].ClassRooms.filter(
        (item) => item.GradeID === classRoomForAddSubj.GradeID
      )[0].Subjects,
      ...subj,
    ]; // filter เพื่อเอา array ของ subject แล้วใส่วิชาที่เพิ่มใหม่ลงไป
    let addToClassRoom = data.Grade.filter(
      (item) => item.Year == classRoomForAddSubj.Year
    )
      .map((item) => item.ClassRooms)[0]
      .map((item) =>
        item.GradeID == classRoomForAddSubj.GradeID
          ? { ...item, Subjects: [...newSubject] }
          : item
      );//map เพื่อนำข้อมูลวิชาที่เพิ่มใหม่ไปใส่ใน object ที่ชั้นเรียนและห้องเรียนที่เราต้องการ (Property ClassRooms)
    setData(() => ({
      ...data,
      Grade: data.Grade.map((grade) =>
        grade.Year == classRoomForAddSubj.Year
          ? {...grade, ClassRooms : addToClassRoom}
          : grade
       ),
    }));//เช็คชั้นเรียนที่ตรงกันแล้วเอา addToClassRoom ลงมาใส่
    setAddSubjectModalActive(false)
  };
  const [classRoomForAddSubj, setClassRoomForAddSubj] = useState({
    Year: null,
    GradeID: null,
  });
  return (
    <>
      {classRoomModalActive ? (
        <SelectClassRoomModal
          confirmChange={changeClassRoomList}
          closeModal={() => setClassRoomModalActive(false)}
          classList={classRoomList}
        />
      ) : null}
      {addSubjectModalActive ? (
        <AddSubjectModal
          classRoomData={classRoomForAddSubj}
          closeModal={() => setAddSubjectModalActive(false)}
          addSubjectToClass={addSubjectToClassRoom}
        />
      ) : null}
      <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1
          className="text-lg flex items-center gap-3"
          onClick={() => {
            console.log(data.Grade);
          }}
        >
          เลือกห้องเรียน
          <p className="text-gray-500 text-xs">
            (ครู{data.Teacher.Firstname} {data.Teacher.Department})
          </p>
        </h1>
        <div
          onClick={() => {
            router.back();
          }}
          className="flex gap-2 items-center justify-between cursor-pointer"
        >
          <TbArrowBackUp size={30} className={`text-gray-700 duration-300`} />
          <p className="text-sm text-gray-500">ย้อนกลับ</p>
        </div>
      </div>
      <span className="flex flex-col gap-4">
        <div className="flex w-full h-[55px] justify-between items-center">
          <div className="flex items-center gap-4">
            <p className="text-md">ชั้นเรียนที่รับผิดชอบ</p>
          </div>
          <div className="flex flex-row gap-3">
            {data.Grade.map((item: any) => (
              <React.Fragment key={`responsibility${item.Year}`}>
                {item.ClassRooms.length !== 0 ? (
                  <MiniButton
                    width={45}
                    height={25}
                    border={true}
                    borderColor="#c7c7c7"
                    title={`ม.${item.Year}`}
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Map ชั้นเรียนของอาจารย์คนนั้นๆที่ต้องรับผิดชอบ */}
        {data.Grade.map((grade: any, index: number) => (
          <React.Fragment key={`Matthayom${grade.Year}`}>
            <div className="flex flex-col gap-3 w-full border border-[#EDEEF3] duration-300">
              <div className="flex w-full h-[55px] justify-between items-center px-4">
                <div
                  className="flex items-center gap-6 cursor-pointer"
                  onClick={() => {
                    hiddenCard(index);
                  }}
                >
                  <p className="text-md">ม.{grade.Year}</p>
                  <IoIosArrowDown
                    className={`${
                      cardHidden.includes(index) ? `rotate-0` : `rotate-180`
                    } duration-500`}
                    size={20}
                  />
                </div>
                <div className="flex flex-row justify-between items-center gap-5">
                  <div className="flex gap-4">
                    {/* // Map ห้องเรียนข้องแต่ละชั้นเรียน */}
                    {grade.ClassRooms.map((room: any) => (
                      <React.Fragment key={`${grade.Year}/${room.GradeID}h`}>
                        <MiniButton
                          height={30}
                          border={true}
                          borderColor="#EDEEF3"
                          titleColor="#000dff"
                          handleClick={() => {
                            setAddSubjectModalActive(true),
                              setClassRoomForAddSubj(() => ({
                                Year: grade.Year,
                                GradeID: room.GradeID,
                              }));
                          }}
                          title={`ม.${grade.Year}/${
                            room.GradeID.toString()[2]
                          }`}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                  <IoMdAddCircle
                    onClick={() => {setClassRoomModalActive(true)}}
                    size={24}
                    className="fill-gray-500 cursor-pointer"
                  />
                </div>
              </div>
              {grade.ClassRooms.length === 0 ? null : (
                <div
                  className={`${
                    cardHidden.includes(index) ? "hidden" : null
                  } flex flex-col gap-3 pl-4 pb-3`}
                >
                  {grade.ClassRooms.map((room: any) => (
                    <React.Fragment key={`${grade.Year}/${room.GradeID}v`}>
                      <div className="flex gap-3">
                        <MiniButton
                          height={30}
                          border={true}
                          borderColor="#EDEEF3"
                          titleColor="#000dff"
                          handleClick={() => {
                            setAddSubjectModalActive(true),
                              setClassRoomForAddSubj(() => ({
                                Year: grade.Year,
                                GradeID: room.GradeID,
                              }));
                          }}
                          title={`ม.${grade.Year}/${
                            room.GradeID.toString()[2]
                          }`}
                        />
                        <div className="flex w-full flex-col gap-3 mt-1">
                          <p className="text-sm text-[#676E85]">
                            {room.Subjects.length === 0
                              ? "ไม่พบข้อมูล กดที่ห้องเรียนเพื่อเพิ่มวิชา"
                              : `รับผิดชอบทั้งหมด ${room.Subjects.length} วิชา`}
                          </p>
                          {room.Subjects.map((subject: any, index: number) => (
                            <React.Fragment
                              key={`${subject.SubjectCode}(${index})`}
                            >
                              <div className="flex justify-between items-center pr-3">
                                <MiniButton
                                  height={30}
                                  border={true}
                                  borderColor="#EDEEF3"
                                  titleColor="#4F515E"
                                  title={`${subject.SubjectCode} ${subject.SubjectName}`}
                                />
                                <p className="text-sm text-[#4F515E]">
                                  จำนวน {subject.TeachHour} คาบ
                                </p>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </span>
    </>
  );
};

export default ClassroomResponsibility;
