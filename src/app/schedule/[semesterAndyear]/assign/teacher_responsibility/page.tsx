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
      `/assign?TeacherID=` +
      searchTeacherID +
      `&Semester=SEMESTER_` +
      semester +
      `&AcademicYear=` +
      academicYear,
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
        RespID: data.RespID,
        GradeID: data.GradeID,
        Subjects: [],
      })); //ทำให้ข้อมูลได้ตาม format แต่จะได้ GradeID ซ้ำๆกันอยู่
      const removeDulpicateGradeID = mapGradeIDOnly.filter(
        (obj, index) =>
          mapGradeIDOnly.findIndex((item) => item.GradeID == obj.GradeID) ===
          index
      ); //เอาตัวซ้ำออก จาก [101, 101, 102] เป็น [101, 102] (array นี่แค่ตัวอย่างเสยๆ)
      let splitSubjects = []; //สร้าง Array เปล่าขึ้นมาสำหรับแยกวิชาของแต่ละห้อง
      for (let i = 0; i < removeDulpicateGradeID.length; i++) {
        //แยกวิชาของแต่ละห้องเป็น 2D array เพื่อที่จะให้มันเรียงตามจำนวนห้องเรียน ex. => [[วิชาเรียนของ id 101], [วิชาเรียนของ id 102], [วิชาเรียนของ id 103]] ข้อมูลก็จะเป็น object ของวิชา
        splitSubjects.push(
          filterResData
            .filter(
              (item) =>
                item.gradelevel.GradeID === removeDulpicateGradeID[i].GradeID
            )
            .map((item) => ({ ...item.subject, TeachHour: item.TeachHour }))
        );
      }
      let result = removeDulpicateGradeID.map((data, index) => ({
        ...data,
        Subjects: splitSubjects[index],
      })); //map วิชาเข้าไปโดยอ้างอิงจาก index เพราะมันตรงกัน
      return result;
    };
    if (!responsibilityData.isLoading) {
      //ถ้า fetch ข้อมูลเสร็จแล้ว
      setData(() => ({
        Teacher: responsibilityData.data[0].teacher, //set ข้อมูลครูลงไป
        Grade: data.Grade.map((item) => ({
          //set ข้อมูลชั้นเรียน ด้วยการ map ข้อมูลปีและห้องเรียน
          Year: item.Year,
          ClassRooms: ClassRoomClassify(item.Year), //เรียกใช้ฟังก์ชั่นเพื่อนำเลขห้องเรียนมาใช้
        })),
      }));
    }
  }, [responsibilityData.isLoading]); //เช็คว่าโหลดเสร็จยัง ถ้าเสร็จแล้วก็ไปทำข้างใน useEffect
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
    setClassRoomList(() => Classrooms);
  };
  const [currentSubjectInClassRoom, setCurrentSubjectInClassRoom] = useState(
    []
  );
  const setCurrentSubject = (subj) => {
    // console.log(subj);
    setCurrentSubjectInClassRoom(subj);
  };
  const [year, setYear] = useState<number>(null);
  const sumTeachHour = (grade): number => {
    // grade.ClassRooms.map(classroom => classroom.Subjects).map(subject => subjectCreditValues[subject.Credit] * 2).reduce((a, b) => a + b)
    const getSubjectsOnly = grade.ClassRooms.map(
      (classroom) => classroom.Subjects
    ); //นำข้อมูลวิชาของแต่ละชั้นปีออกมาจาก property Classroom
    const tempSubjects = []; //สร้าง array เปล่าเพื่อเก็บ object ของวิชาที่เอามาจาก หลายๆห้องเรียนใน 1 ระดับชั้นมาไว้ใน array เดียว
    for (let i = 0; i < getSubjectsOnly.length; i++) {
      tempSubjects.push(...getSubjectsOnly[i]); //push เข้าไปด้วยการใช้ spread operator ex => จาก [[{...}, {...}], [{...}]] เป็น [{...}, {...}, {...}]
    }
    const mapTeachHour = tempSubjects.map(
      (subject) => subjectCreditValues[subject.Credit] * 2
    ); //เราจะ map เอาแค่ชัวโมงที่สอนจากแต่ละ object ex => [3, 1, 1, 3]
    const result = mapTeachHour.reduce((a, b) => a + b); //sum ตัวเลชทั้งหมดใน array เข้าด้วยกัน
    return result;
  };
  const saveData = () => {
    const classRoomMap = data.Grade.map((item) => item.ClassRooms); //map จากตัวแปร data เพื่อเอาข้อมูลของแต่ละชั้นปีมา
    const spreadClassRoom = []; //สร้าง array เปล่าเพื่อเก็บ object ของทุกๆห้องเรียนในทุกระดับชั้นไว้ใน array เดียว
    for (let i = 0; i < classRoomMap.length; i++) {
      spreadClassRoom.push(...classRoomMap[i]); //push เข้าไปด้วยการใช้ spread operator ex => จาก [[{...}, {...}], [{...}]] เป็น [{...}, {...}, {...}]
    }
    const postData = {
      TeacherID: data.Teacher.TeacherID,
      Resp: spreadClassRoom,
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}`,
    };
    saveApi(postData);
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
          currentSubject={currentSubjectInClassRoom}
        />
      ) : null}
      {responsibilityData.isLoading ? <Loading /> : null}
      <span className="flex flex-col gap-4 my-4">
        <div className="flex w-full h-[55px] justify-between items-center">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <p
                className="text-md"
                onClick={() => {
                  console.log(data);
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
                            setCurrentSubject(room.Subjects);
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
                            setCurrentSubject(room.Subjects);
                          }}
                          title={`ม.${grade.Year}/${room.GradeID.substring(2)}`}
                        />
                        <div className="flex w-full flex-col gap-3 mt-1">
                          <p className="text-sm text-[#676E85]">
                            {room.Subjects.length === 0
                              ? "ไม่พบข้อมูล กดที่ห้องเรียนเพื่อเพิ่มวิชา"
                              : `รับผิดชอบทั้งหมด ${room.Subjects.length} วิชา`}
                          </p>
                          {room.Subjects.map((subject: any, index: number) => (
                            <Fragment key={`${subject.SubjectCode}(${index})`}>
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
                      {sumTeachHour(grade)} ชั่วโมง
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
