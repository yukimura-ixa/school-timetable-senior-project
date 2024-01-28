"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import { useParams, useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { TbArrowBackUp } from "react-icons/tb";
import { useSearchParams } from "next/navigation";
import { IoIosArrowDown, IoMdAdd, IoMdAddCircle } from "react-icons/io";
import SelectClassRoomModal from "../component/SelectClassRoomModal";
import AddSubjectModal from "../component/AddSubjectModal";
import useSWR from "swr";
import api, { fetcher } from "@/libs/axios";
import Loading from "@/app/loading";
import { gradelevel, subject, subject_credit } from "@prisma/client";
import { subjectCreditValues } from "@/models/credit-value";
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
    //ข้อมูลหลักที่ fetch มาจาก api
    () =>
      `/assign?TeacherID=${searchTeacherID}&Semester=SEMESTER_${semester}&AcademicYear=${academicYear}`,
    fetcher
  );
  const teacherData = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/teacher?TeacherID=${searchTeacherID}`,
    fetcher
  );
  // นำข้อมูลต่างๆมาแยกย่อยให้ใช้ได้สะดวก
  const [data, setData] = useState({
    Teacher: {
      //ข้อมูลเปล่า เอาไว้กันแตก
      TeacherID: null,
      Prefix: "",
      Firstname: "",
      Lastname: "",
      Department: "",
    },
    Grade: [
      { Year: 1, ClassRooms: [] }, //ClassRooms : [{RespID: 1,GradeID:'101', Subjects:[]}]
      { Year: 2, ClassRooms: [] },
      { Year: 3, ClassRooms: [] },
      { Year: 4, ClassRooms: [] },
      { Year: 5, ClassRooms: [] },
      { Year: 6, ClassRooms: [] },
    ],
    Subjects: []
  });
  useEffect(() => {
    const ClassRoomClassify = (year: number): String[] => {
      //function สำหรับจำแนกชั้นเรียนสำหรับนำข้อมูลไปใช้งานเพื่อแสดงผลบนหน้าเว็บโดยเฉพาะ
      //รูปแบบข้อมูล จะมาประมาณนี้ (responsibilityData.data variable)
      //{RespID: 1, TeacherID: 1, GradeID: '101', ...}
      //{RespID: 1, TeacherID: 1, GradeID: '101', ...}
      //{RespID: 1, TeacherID: 1, GradeID: '102', ...}
      const filterResData = responsibilityData.data.filter(
        (data) => data.gradelevel.Year == year
      ); //เช่น Year == 1 ก็จะเอาแต่ข้อมูลของ ม.1 มา
      const mapGradeIDOnly = filterResData.map((data) => ({
        GradeID: data.GradeID,
        // Subjects: [],
      })); //ทำให้ข้อมูลได้ตาม format แต่จะได้ GradeID ซ้ำๆกันอยู่
      const removeDulpicateGradeID = mapGradeIDOnly.filter(
        (obj, index) =>
          mapGradeIDOnly.findIndex((item) => item.GradeID == obj.GradeID) ===
          index
      ); //เอาตัวซ้ำออก จาก [101, 101, 102] เป็น [101, 102] (array นี่แค่ตัวอย่างเสยๆ)
      return removeDulpicateGradeID;
    };
    if (!responsibilityData.isLoading) {
      //ถ้า fetch ข้อมูลเสร็จแล้ว
      setData(() => ({
        ...data,
        Subjects: responsibilityData.data,
        Grade: data.Grade.map((item) => ({
          //set ข้อมูลชั้นเรียน ด้วยการ map ข้อมูลปีและห้องเรียน
          Year: item.Year,
          ClassRooms: ClassRoomClassify(item.Year), //เรียกใช้ฟังก์ชั่นเพื่อนำเลขห้องเรียนมาใช้
        })),
      }));
    }
  }, [responsibilityData.isLoading]); //เช็คว่าโหลดเสร็จยัง ถ้าเสร็จแล้วก็ไปทำข้างใน useEffect
  useEffect(() => {
    if (!teacherData.isLoading) {
      setData(() => ({ ...data, Teacher: teacherData.data }));
    }
  }, [teacherData.isLoading]);
  const router = useRouter();
  const [classRoomModalActive, setClassRoomModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  const [addSubjectModalActive, setAddSubjectModalActive] =
    useState<boolean>(false); //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
  // const [selectedClass, setSelectedClass] = useState<number>(2); //เซ็ทไว้ดึงข้อมูลห้องเรียนทั้งหมดว่ามีกี่ห้อง -> ส่งไปที่ Modal
  const [classRoomList, setClassRoomList] = useState<[]>([]); //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
  // ยังไม่เสร็จ
  const changeClassRoomList = (rooms: [], year: number) => {
    //ข้อจำกัดคือ ถ้าลบห้องเรียนแล้วเพิ่มใหม่ ก็ต้องเพิ่มวิชาใหม่
    setClassRoomList(() => rooms);
    setData(() => ({
      ...data,
      Grade: data.Grade.map((item) =>
        item.Year == year //เช็คก่อนว่าเพิ่มชั้นเรียนของปีอะไร
          ? {
              ...item,
              ClassRooms: rooms, //วางข้อมูลห้องเรียนที่อัปเดตลงไป
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
    // let newSubjects = subj
    // let currentSubjects = 
    // const removeDulpicateData = addNewSubjects.filter(
    //   (obj, index) =>
    //     addNewSubjects.findIndex((item) => item.GradeID == obj.GradeID && item.SubjectCode == obj.SubjectCode) ===
    //     index
    // );
    setData(() => ({
      ...data,
      Subjects : subj
    })); //เช็คชั้นเรียนที่ตรงกันแล้วเอา addToClassRoom ลงมาใส่
    // setAddSubjectModalActive(false);
  };
  const addClassRoomtoClass = (Year, Classrooms) => { //func สำหรับเพิ่มห้องเรียนที่เลือกมาใหม่เข้าไปในชั้นเรียนหลังกดตกลงใน SelectClassRoomModal
    setClassRoomModalActive(true);
    setYear(() => Year);
    setClassRoomList(() => Classrooms);
  };
  const [classRoomForAddSubj, setClassRoomForAddSubj] = useState({
    Year: null,
    GradeID: null,
  }); //ตัวแปรนี้จะเก็บค่าตามที่เห็น จะเก็บก็ต่อเมื่อกดปุ่มห้องเรียน เช่น 1/1 ก็เก็บ Year = 1 GradeID = 101 เป็นต้น
  const [currentSubjectInClassRoom, setCurrentSubjectInClassRoom] = useState(
    []
  ); //ตัวแปรนี้เก็บข้อมูลวิชาของห้องเรียนที่เราเลือก
  const setCurrentSubject = (subj) => { //จะเป็นตัว set ข้อมูลให้กับตัวแปรด้านบนเฉยๆ (ละจะสร้างให้เปลืองที่ไมฟะ??)
    setCurrentSubjectInClassRoom(subj);
  };
  const [year, setYear] = useState<number>(null);
  // const sumTeachHour = (grade): number => {
  //   // grade.ClassRooms.map(classroom => classroom.Subjects).map(subject => subjectCreditValues[subject.Credit] * 2).reduce((a, b) => a + b)
  //   const getSubjectsOnly = grade.ClassRooms.map(
  //     (classroom) => classroom.Subjects
  //   ); //นำข้อมูลวิชาของแต่ละชั้นปีออกมาจาก property Classroom
  //   const tempSubjects = []; //สร้าง array เปล่าเพื่อเก็บ object ของวิชาที่เอามาจาก หลายๆห้องเรียนใน 1 ระดับชั้นมาไว้ใน array เดียว
  //   for (let i = 0; i < getSubjectsOnly.length; i++) {
  //     tempSubjects.push(...getSubjectsOnly[i]); //push เข้าไปด้วยการใช้ spread operator ex => จาก [[{...}, {...}], [{...}]] เป็น [{...}, {...}, {...}]
  //   }
  //   const mapTeachHour = tempSubjects.map(
  //     (subject) => subjectCreditValues[subject.Credit] * 2
  //   ); //เราจะ map เอาแค่ชัวโมงที่สอนจากแต่ละ object ex => [3, 1, 1, 3]
  //   if (mapTeachHour.length == 0) {
  //     //ถ้าไม่เคยมีการเพิ่มวิชาในห้องเรียนมาก่อน ระบบจะนับเป็น 0 ชั่วโมง
  //     return 0;
  //   } else {
  //     return mapTeachHour.reduce((a, b) => a + b); //sum ตัวเลชทั้งหมดใน array เข้าด้วยกัน (result)
  //   }
  // };
  const getSubjectDataByGradeID = (GradeID: string) => { //เอาข้อมูลของชั้นเรียนที่ต้องการ
    //ตัวอย่างถ้าส่ง GradeID = 101 ไป ก็จะได้แบบนี้
    // {RespID: 1, TeacherID: 1, GradeID: '101', SubjectCode: 'ddddd', AcademicYear: 2566, …}
    // {RespID: 2, TeacherID: 1, GradeID: '101', SubjectCode: 'I20102', AcademicYear: 2566, …}
    return data.Subjects.filter(item => item.GradeID == GradeID);
  }
  const saveData = () => {
    const classRoomMap = data.Grade.map((item) => item.ClassRooms); //map จากตัวแปร data เพื่อเอาข้อมูลของแต่ละชั้นปีมา
    const spreadClassRoom = []; //สร้าง array เปล่าเพื่อเก็บ object ของทุกๆห้องเรียนในทุกระดับชั้นไว้ใน array เดียว
    for (let i = 0; i < classRoomMap.length; i++) {
      spreadClassRoom.push(...classRoomMap[i]); //push เข้าไปด้วยการใช้ spread operator ex => จาก [[{...}, {...}], [{...}]] เป็น [{...}, {...}, {...}]
    }
    console.log(classRoomMap);
    //   {
    //     TeacherID: 1,
    //     Resp: [{RespID: 1, TeacherID: 1, GradeID: '102', ...},{RespID: 1, TeacherID: 1, GradeID: '102', ...}, {TeacherID: 1, GradeID: '102', ...}],
    //     AcademicYear: 2566,
    //     Semester: "SEMESTER_1",
    // }
    const postData = {
      TeacherID: data.Teacher.TeacherID,
      Resp: spreadClassRoom,
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}`,
    };
    console.log(postData);
    // saveApi(postData);
  };

  const saveApi = async (data) => {
    const response = await api.post("/assign", data);
    console.log(response);
    if (response.status === 200) {
      console.log("บันทึกข้อมูลสำเร็จ");
      responsibilityData.mutate();
    }
  };
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
          currentSubject={data.Subjects} 
          subjectByGradeID={currentSubjectInClassRoom}/>
      ) : null}
      {responsibilityData.isLoading ? <Loading /> : null}
      <span className="flex flex-col gap-4 my-4">
        <div className="flex w-full h-[55px] justify-between items-center">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <p
                className="text-md"
                onClick={() => {
                  // console.log(data.Subjects.filter(item => item.GradeID == '101').map(data => data.subject));
                  console.log(data)
                }}
              >
                ชั้นเรียนที่รับผิดชอบ
              </p>
              <p className="text-gray-500 text-xs">
                (คุณครู{data.Teacher.Firstname} {data.Teacher.Lastname})
              </p>
            </div>
            <div
              onClick={() => {
                router.back();
              }}
              className="flex gap-2 items-center justify-between cursor-pointer"
            >
              <TbArrowBackUp
                size={30}
                className={`text-gray-700 duration-300`}
              />
              <p className="text-sm text-gray-500">ย้อนกลับ</p>
            </div>
          </div>
        </div>
        {/* Map ชั้นเรียนที่ครูคนนั้นรับผิดชอบ */}
        {/* <div className="flex flex-row gap-3">
          {responsibilityData.data.map((item: any) => (
            <React.Fragment key={`responsibility${item.RespID}`}>
              {responsibilityData.data.length !== 0 ? (
                <MiniButton
                  width={45}
                  height={25}
                  border={true}
                  borderColor="#c7c7c7"
                  title={`ม.${item.GradeID.substring(0,1)}/${item.GradeID.substring(2)}`}
                />
              ) : null}
            </React.Fragment>
          ))}
        </div> */}
        {/* Map ชั้นเรียนของอาจารย์คนนั้นๆที่ต้องรับผิดชอบ */}
        {data.Grade.map((grade: any, index: number) => (
          <Fragment key={`Grade${grade.Year}`}>
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
                      <Fragment key={`Class${room.GradeID}`}>
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
                            // setCurrentSubject(room.Subjects);
                            setCurrentSubject(getSubjectDataByGradeID(room.GradeID));
                          }}
                          title={`ม.${grade.Year}/${room.GradeID.substring(2)}`}
                        />
                      </Fragment>
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
                    <Fragment key={`Details for Class ${room.GradeID}`}>
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
                            setCurrentSubject(getSubjectDataByGradeID(room.GradeID));
                          }}
                          title={`ม.${grade.Year}/${room.GradeID.substring(2)}`}
                        />
                        <div className="flex w-full flex-col gap-3 mt-1">
                          <p className="text-sm text-[#676E85]">
                            {getSubjectDataByGradeID(room.GradeID).length === 0
                              ? "ไม่พบข้อมูล กดที่ห้องเรียนเพื่อเพิ่มวิชา"
                              : `รับผิดชอบทั้งหมด ${getSubjectDataByGradeID(room.GradeID).length} วิชา`}
                          </p>
                          {getSubjectDataByGradeID(room.GradeID).map((subject: any, index:number) => (
                            <Fragment key={`${subject.SubjectCode}(${room.GradeID})${index}`}>
                              <div className="flex justify-between items-center pr-3">
                                <MiniButton
                                  height={30}
                                  border={true}
                                  borderColor="#EDEEF3"
                                  titleColor="#4F515E"
                                  title={`${subject.SubjectCode} ${subject.SubjectName}`}
                                />
                                <p className="text-sm text-[#4F515E]">
                                  จำนวน{" "}
                                  {subjectCreditValues[subject.Credit] * 2}{" "}
                                  ชั่วโมง
                                </p>
                              </div>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                  <div className="w-full pr-3 mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                      รวมชั่วโมงที่สอนทั้งหมด
                    </p>
                    <p className="text-sm text-gray-400">
                      {/* {sumTeachHour(grade)} ชั่วโมง */} xx ชั่วโมง
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Fragment>
        ))}
        <div
          onClick={saveData}
          className="flex w-full bg-emerald-100 hover:bg-emerald-200 duration-300 cursor-pointer h-10 rounded justify-center items-center"
        >
          <p className="text-emerald-500 text-sm">บันทึกข้อมูล</p>
        </div>
      </span>
    </>
  );
}

export default ClassroomResponsibility;
