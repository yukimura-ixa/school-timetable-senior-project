"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { useSearchParams } from "next/navigation";
import { IoIosArrowDown, IoMdAdd, IoMdAddCircle } from "react-icons/io";
import SelectClassRoomModal from "../component/SelectClassRoomModal";
import AddSubjectModal from "../component/AddSubjectModal";
import useSWR from "swr";
import { fetcher } from "@/libs/axios";
type Props = {
  backPage: Function;
};

function ClassroomResponsibility(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const searchTeacherID = useSearchParams().get("TeacherID");
  const responsibilityData = useSWR(
    () =>
      `/assign?TeacherID=` +
      searchTeacherID +
      `&Semester=` +
      semester +
      `&AcademicYear=` +
      academicYear,
    fetcher
  );
  const [data, setData] = useState({
    Teacher: {
      TeacherID: null,
      Prefix: "",
      Firstname: "",
      Lastname: "",
      Department: "",
    },
    Grade: [
      { Year: 1, ClassRooms: [] },
      { Year: 2, ClassRooms: [] },
      { Year: 3, ClassRooms: [] },
      { Year: 4, ClassRooms: [] },
      { Year: 5, ClassRooms: [] },
      { Year: 6, ClassRooms: [] },
    ],
  });
  useEffect(() => {
    const getData = () => {
      axios
        .get(`http://localhost:3000/api/classify?TeacherID=${searchTeacherID}`)
        .then((res) => {
          let teacher = res.data.Teacher;
          let grade_classify = res.data.Grade;
          let grade_upadted = data.Grade.map((grade) =>
            grade_classify.map((year) => year.Year).includes(grade.Year)
              ? grade_classify.filter((item) => item.Year == grade.Year)[0]
              : grade
          );
          setData(() => ({
            Teacher: teacher,
            Grade: grade_upadted,
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    };
    return () => getData();
  }, []);
  const router = useRouter();
  const [classRoomModalActive, setClassRoomModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  const [addSubjectModalActive, setAddSubjectModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  // const [selectedClass, setSelectedClass] = useState<number>(2); //เซ็ทไว้ดึงข้อมูลห้องเรียนทั้งหมดว่ามีกี่ห้อง -> ส่งไปที่ Modal
  const [classRoomList, setClassRoomList] = useState<number[]>([]); //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
  // ยังไม่เสร็จ
  const changeClassRoomList = (rooms: number[], year: number) => {
    //ข้อจำกัดคือ ถ้าลบห้องเรียนแล้วเพิ่มใหม่ ก็ต้องเพิ่มวิชาใหม่
    setClassRoomList(() => rooms);
    // มึนชิบหาย
    setData(() => ({
      ...data,
      Grade: data.Grade.map((item) =>
        item.Year == year //เช็คก่อนว่าเพิ่มชั้นเรียนของปีอะไร
          ? {
              ...item,
              ClassRooms:
                //เช็คว่ามีห้องเรียนเพิ่มเข้ามาใหม่หรือเปล่า ถ้ามีก็จะนำห้องใหม่เข้ามาโดยให้ข้อมูลของ rooms นั้น filter โดยการเช็คเลขห้องว่า ถ้ามีอยู่แล้วก็ไม่ต้องใส่เพิ่มมา
                item.ClassRooms.length <= rooms.length
                  ? [
                      ...item.ClassRooms, //[201, 202]
                      ...rooms //[201, 202, 203] res = [203]
                        .map((item) => ({ GradeID: item, Subjects: [] })) //map ห้องที่เพิ่มใหม่เข้าไป
                        .filter(
                          (room) =>
                            !item.ClassRooms.map((gid) => gid.GradeID).includes(
                              room.GradeID
                            )
                        ), //ตรงนี้กรองห้องที่ซ้ำกันออกไป
                    ]
                  : item.ClassRooms.filter((item) =>
                        rooms.map((gid) => gid).includes(item.GradeID)
                      ).length == 0 //เช็คว่าถ้ากดลบห้องเรียนออกจากชั้นนั้นหมด
                    ? [] //จะให้คืนเป็น []
                    : item.ClassRooms.filter((item) =>
                        rooms.map((gid) => gid).includes(item.GradeID)
                      ), //ถ้าไม่ใช้ก็แค่กรองห้องเรียนที่เรานำออก
            }
          : item
      ),
    }));
    setClassRoomModalActive(false);
  };
  const [cardHidden, setCardHidden] = useState<number[]>([0, 1, 2, 3, 4, 5]); //ใช้สำหรับ การ์ด ม1-ม6
  const hiddenCard = (index: number) => {
    if (cardHidden.includes(index)) {
      setCardHidden(() => cardHidden.filter((item) => item !== index));
    } else {
      setCardHidden(() => [...cardHidden, index]);
    }
  };
  const addSubjectToClassRoom = (subj: any) => {
    let addToClassRoom = data.Grade.filter(
      (item) => item.Year == classRoomForAddSubj.Year
    )
      .map((item) => item.ClassRooms)[0]
      .map((item) =>
        item.GradeID == classRoomForAddSubj.GradeID
          ? { ...item, Subjects: [...subj] }
          : item
      ); //map เพื่อนำข้อมูลวิชาที่เพิ่มใหม่ไปใส่ใน object ที่ชั้นเรียนและห้องเรียนที่เราต้องการ (Property ClassRooms)
    setData(() => ({
      ...data,
      Grade: data.Grade.map((grade) =>
        grade.Year == classRoomForAddSubj.Year
          ? { ...grade, ClassRooms: addToClassRoom }
          : grade
      ),
    })); //เช็คชั้นเรียนที่ตรงกันแล้วเอา addToClassRoom ลงมาใส่
    setAddSubjectModalActive(false);
  };
  const [classRoomForAddSubj, setClassRoomForAddSubj] = useState({
    Year: null,
    GradeID: null,
  });
  const addClassRoomtoClass = (Year, Classrooms) => {
    setClassRoomModalActive(true);
    setYear(() => Year);
    setClassRoomList(() =>
      Classrooms.map((item) => item.GradeID).map((item) =>
        parseInt(item.toString()[2])
      )
    );
  };
  const [currentSubjectInClassRoom, setCurrentSubjectInClassRoom] = useState(
    []
  );
  const setCurrentSubject = (subj) => {
    console.log(subj);
    setCurrentSubjectInClassRoom(subj);
  };
  const [year, setYear] = useState<number>(null);
  return (
    <>
      {classRoomModalActive ? (
        <SelectClassRoomModal
          confirmChange={changeClassRoomList}
          closeModal={() => setClassRoomModalActive(false)}
          classList={classRoomList}
          year={year}
        />
      ) : null}
      {addSubjectModalActive ? (
        <AddSubjectModal
          classRoomData={classRoomForAddSubj}
          closeModal={() => setAddSubjectModalActive(false)}
          addSubjectToClass={addSubjectToClassRoom}
          currentSubject={currentSubjectInClassRoom}
        />
      ) : null}
      <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
        <h1
          className="text-lg flex items-center gap-3"
          onClick={() => {
            console.log(classRoomList);
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
          <div className="flex flex-row gap-3 border border-green">
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
                            setCurrentSubject(room.Subjects);
                          }}
                          title={`ม.${grade.Year}/${
                            room.GradeID.toString()[2]
                          }`}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                  <IoMdAddCircle
                    onClick={() => {
                      addClassRoomtoClass(grade.Year, grade.ClassRooms);
                    }}
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
                            setCurrentSubject(room.Subjects);
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
}

export default ClassroomResponsibility;
