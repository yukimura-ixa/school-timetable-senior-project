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
import Loading from "@/app/loading";
import {
  subjectCreditValues,
  subject_credit,
  type SubjectCreditValues,
} from "@/models/credit-value";
import { enqueueSnackbar } from "notistack";
import { useSemesterSync } from "@/hooks";

// Server Actions (Clean Architecture)
import {
  getAssignmentsAction,
  syncAssignmentsAction,
} from "@/features/assign/application/actions/assign.actions";
import { getTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

function ClassroomResponsibility() {
  const params = useParams();
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  // Use useSemesterSync to extract and sync semester with global store
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );

  const searchTeacherID = useSearchParams().get("TeacherID");

  // Fetch teacher responsibilities using Server Action
  const responsibilityData = useSWR<any>(
    () =>
      searchTeacherID
        ? `assign-${searchTeacherID}-${academicYear}-${semester}`
        : null,
    async () => {
      if (!searchTeacherID) return null;
      try {
        const result = await getAssignmentsAction({
          TeacherID: parseInt(searchTeacherID),
          AcademicYear: parseInt(academicYear),
          Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        });
        // getAssignmentsAction returns data directly (array)
        return result;
      } catch (error) {
        console.error("Error fetching assignments:", error);
        return null;
      }
    },
    { revalidateOnFocus: false },
  );

  // Fetch teacher data using Server Action
  const teacherData = useSWR<any>(
    () => (searchTeacherID ? `teacher-${searchTeacherID}` : null),
    async () => {
      if (!searchTeacherID) return null;
      const result = await getTeachersAction({});
      if (!result || typeof result !== "object" || !("success" in result)) {
        return null;
      }
      if (result.success && "data" in result) {
        const teacher = (result.data as any[]).find(
          (t: any) => t.TeacherID === parseInt(searchTeacherID),
        );
        return teacher || null;
      }
      return null;
    },
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
      { Year: 1, ClassRooms: [] as any[] }, //ClassRooms : [{RespID: 1,GradeID:'101', Subjects:[]}]
      { Year: 2, ClassRooms: [] as any[] },
      { Year: 3, ClassRooms: [] as any[] },
      { Year: 4, ClassRooms: [] as any[] },
      { Year: 5, ClassRooms: [] as any[] },
      { Year: 6, ClassRooms: [] as any[] },
    ],
    Subjects: [] as any[],
  });
  useEffect(() => {
    const ClassRoomClassify = (year: number): string[] => {
      //function สำหรับจำแนกชั้นเรียนสำหรับนำข้อมูลไปใช้งานเพื่อแสดงผลบนหน้าเว็บโดยเฉพาะ
      //รูปแบบข้อมูล จะมาประมาณนี้ (responsibilityData.data variable)
      //{RespID: 1, TeacherID: 1, GradeID: '101', ...}
      //{RespID: 1, TeacherID: 1, GradeID: '101', ...}
      //{RespID: 1, TeacherID: 1, GradeID: '102', ...}
      const filterResData = responsibilityData.data.filter(
        (data: any) => data.gradelevel.Year == year,
      ); //เช่น Year == 1 ก็จะเอาแต่ข้อมูลของ ม.1 มา
      const mapGradeIDOnly = filterResData.map((data: any) => ({
        GradeID: data.GradeID,
        // Subjects: [],
      })); //ทำให้ข้อมูลได้ตาม format แต่จะได้ GradeID ซ้ำๆกันอยู่
      const removeDulpicateGradeID = mapGradeIDOnly.filter(
        (obj: any, index: number) =>
          mapGradeIDOnly.findIndex(
            (item: any) => item.GradeID == obj.GradeID,
          ) === index,
      ); //เอาตัวซ้ำออก จาก [101, 101, 102] เป็น [101, 102] (array นี่แค่ตัวอย่างเสยๆ)
      return removeDulpicateGradeID;
    };
    if (!responsibilityData.isValidating) {
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
  }, [responsibilityData.isValidating]); //เช็คว่าโหลดเสร็จยัง ถ้าเสร็จแล้วก็ไปทำข้างใน useEffect
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
    setClassRoomList(rooms);
    setData(() => {
      const newData = data;
      if (rooms.length > 0) {
        const gradeIndex = data.Grade.findIndex((item) => item.Year == year);
        if (gradeIndex !== -1 && newData.Grade[gradeIndex]) {
          newData.Grade[gradeIndex].ClassRooms = rooms;
        }
      } else {
        const gradeIndex = data.Grade.findIndex((item) => item.Year == year);
        if (gradeIndex !== -1 && newData.Grade[gradeIndex]) {
          newData.Grade[gradeIndex].ClassRooms = [];
        }
      }
      return newData;
    });
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
    setData(() => ({
      ...data,
      Subjects: subj,
    }));
  };
  const addClassRoomtoClass = (Year: number, Classrooms: any) => {
    //func สำหรับเพิ่มห้องเรียนที่เลือกมาใหม่เข้าไปในชั้นเรียนหลังกดตกลงใน SelectClassRoomModal
    setClassRoomModalActive(true);
    setYear(() => Year);
    setClassRoomList(() => Classrooms);
  };
  const [classRoomForAddSubj, setClassRoomForAddSubj] = useState({
    Year: 0,
    GradeID: "",
    Number: 0,
  }); //ตัวแปรนี้จะเก็บค่าตามที่เห็น จะเก็บก็ต่อเมื่อกดปุ่มห้องเรียน เช่น 1/1 ก็เก็บ Year = 1 GradeID = 101 เป็นต้น
  const [currentSubjectInClassRoom, setCurrentSubjectInClassRoom] = useState(
    [],
  ); //ตัวแปรนี้เก็บข้อมูลวิชาของห้องเรียนที่เราเลือก
  const setCurrentSubject = (subj: any) => {
    //จะเป็นตัว set ข้อมูลให้กับตัวแปรด้านบนเฉยๆ (ละจะสร้างให้เปลืองที่ไมฟะ??)
    setCurrentSubjectInClassRoom(subj);
  };
  const [year, setYear] = useState<number | null>(null);

  // Helper function to check if a value is a valid subject_credit
  const isValidCredit = (value: any): value is subject_credit => {
    return typeof value === "string" && value in subjectCreditValues;
  };

  const sumTeachHour = (year: number): number => {
    const getSubjectsByYear = data.Subjects.filter(
      (subj) => subj.GradeID?.[0] && parseInt(subj.GradeID[0]) == year,
    ); //นำข้อมูลวิชาของแต่ละชั้นปีออกมาจาก property Subjects
    const mapTeachHour = getSubjectsByYear.map((item) => {
      const credit = item.Credit;
      return (isValidCredit(credit) ? subjectCreditValues[credit] : 0) * 2;
    }); //map credit เป็น array ex. => [1, 3, 1]
    if (mapTeachHour.length == 0) {
      //ถ้าไม่เคยมีการเพิ่มวิชาในห้องเรียนมาก่อน ระบบจะนับเป็น 0 คาบ
      return 0;
    } else {
      return mapTeachHour.reduce((a, b) => a + b); //sum ตัวเลชทั้งหมดใน array เข้าด้วยกัน (result)
    }
  };
  const getSubjectDataByGradeID = (GradeID: string) => {
    //เอาข้อมูลของชั้นเรียนที่ต้องการ
    //ตัวอย่างถ้าส่ง GradeID = 101 ไป ก็จะได้แบบนี้
    // {RespID: 1, TeacherID: 1, GradeID: '101', SubjectCode: 'ddddd', AcademicYear: 2566, …}
    // {RespID: 2, TeacherID: 1, GradeID: '101', SubjectCode: 'I20102', AcademicYear: 2566, …}
    return data.Subjects.filter((item) => item.GradeID == GradeID);
  };
  const [validateStatus, setValidateStatus] = useState<boolean>(false); //พอเรียก func validate ข้อมูลแล้ว ถ้าผ่านจะทำการเปลี่ยน state
  const validateEmptySubjects = (GradeID: string): boolean => {
    const mapGradeID = data.Subjects.map((item) => item.GradeID);
    const removeDulpicateGradeID = mapGradeID.filter(
      (obj, index) => mapGradeID.findIndex((item) => item == obj) === index,
    ); //เอาตัวซ้ำออก จาก [101, 101, 102] เป็น [101, 102] (array นี่แค่ตัวอย่างเสยๆ)
    return !removeDulpicateGradeID.includes(GradeID);
  };

  const saveData = () => {
    const classRoomMap = data.Grade.map((item) => item.ClassRooms); //map จากตัวแปร data เพื่อเอาข้อมูลของแต่ละชั้นปีมา
    const spreadClassRoom: any[] = []; //สร้าง array เปล่าเพื่อเก็บ object ของทุกๆห้องเรียนในทุกระดับชั้นไว้ใน array เดียว
    for (let i = 0; i < classRoomMap.length; i++) {
      const classRoom = classRoomMap[i];
      if (classRoom && Array.isArray(classRoom)) {
        spreadClassRoom.push(...classRoom); //push เข้าไปด้วยการใช้ spread operator ex => จาก [[{...}, {...}], [{...}]] เป็น [{...}, {...}, {...}]
      }
    }
    //findEmptySubjectInClassRoom คือการหาว่า มีห้องไหนมั้ยที่ยังไม่เพิ่มวิชาเรียน ถ้ามีก็จะฟ้องครับผม
    //return as Array => if true array length > 0, if false array length = 0
    const filterSubject = data.Subjects.filter((item) =>
      spreadClassRoom.map((item) => item.GradeID).includes(item.GradeID),
    );
    const postData = {
      TeacherID: data.Teacher.TeacherID,
      Resp: filterSubject,
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}`,
    };
    const findEmptySubjectInClassRoom = spreadClassRoom.filter((item) =>
      validateEmptySubjects(item.GradeID),
    );
    if (findEmptySubjectInClassRoom.length > 0) {
      setValidateStatus(true);
      enqueueSnackbar(
        "ไม่สามารถบันทึกข้อมูลได้เนื่องจากยังเพิ่มวิชาเรียนไม่ครบทุกชั้นเรียน",
        { variant: "warning" },
      );
    } else {
      setValidateStatus(false);
      console.log(postData);
      saveApi(postData);
    }
  };

  const saveApi = async (data: any) => {
    setIsApiLoading(true);
    try {
      const result = await syncAssignmentsAction({
        TeacherID: data.TeacherID,
        Resp: data.Resp,
        AcademicYear: data.AcademicYear,
        Semester: data.Semester as "SEMESTER_1" | "SEMESTER_2",
      });

      // syncAssignmentsAction returns result directly, not wrapped in success/error
      setValidateStatus(false);
      setIsApiLoading(false);
      enqueueSnackbar("บันทึกข้อมูลสำเร็จ", { variant: "success" });
      responsibilityData.mutate();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึก: " + errorMessage, {
        variant: "error",
      });
      setIsApiLoading(false);
    }
  };
  return (
    <>
      {classRoomModalActive ? (
        <SelectClassRoomModal
          confirmChange={changeClassRoomList as any}
          closeModal={() => setClassRoomModalActive(false)}
          classList={classRoomList}
          year={year || 0}
        />
      ) : null}
      {addSubjectModalActive ? (
        <AddSubjectModal
          classRoomData={classRoomForAddSubj}
          closeModal={() => setAddSubjectModalActive(false)}
          addSubjectToClass={addSubjectToClassRoom}
          currentSubject={data.Subjects}
          subjectByGradeID={currentSubjectInClassRoom}
        />
      ) : null}
      {responsibilityData.isValidating || isApiLoading ? <Loading /> : null}
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
                          width={80}
                          height={30}
                          buttonColor="#fff"
                          titleColor="#000dff"
                          border={true}
                          borderColor="#EDEEF3"
                          isSelected={false}
                          hoverable={true}
                          handleClick={() => {
                            (setAddSubjectModalActive(true),
                              setClassRoomForAddSubj(() => ({
                                Year: grade.Year,
                                GradeID: room.GradeID,
                                Number: parseInt(room.GradeID.substring(2)),
                              })));
                            // setCurrentSubject(room.Subjects);
                            setCurrentSubject(
                              getSubjectDataByGradeID(room.GradeID),
                            );
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
                          width={80}
                          height={30}
                          buttonColor="#fff"
                          titleColor="#000dff"
                          border={true}
                          borderColor="#EDEEF3"
                          isSelected={false}
                          hoverable={true}
                          handleClick={() => {
                            (setAddSubjectModalActive(true),
                              setClassRoomForAddSubj(() => ({
                                Year: grade.Year,
                                GradeID: room.GradeID,
                                Number: parseInt(room.GradeID.substring(2)),
                              })));
                            setCurrentSubject(
                              getSubjectDataByGradeID(room.GradeID),
                            );
                          }}
                          title={`ม.${grade.Year}/${room.GradeID.substring(2)}`}
                        />
                        <div className="flex w-full flex-col gap-3 mt-1">
                          <p className="text-sm text-[#676E85]">
                            {getSubjectDataByGradeID(room.GradeID).length === 0
                              ? "ไม่พบข้อมูล กดที่ชั้นเรียนเพื่อเพิ่มวิชา"
                              : `รับผิดชอบทั้งหมด ${
                                  getSubjectDataByGradeID(room.GradeID).length
                                } วิชา`}
                          </p>
                          {getSubjectDataByGradeID(room.GradeID).map(
                            (subject: any, index: number) => {
                              const credit = subject.Credit;
                              const hoursPerWeek =
                                (isValidCredit(credit)
                                  ? subjectCreditValues[credit]
                                  : 0) * 2;
                              return (
                                <Fragment
                                  key={`${subject.SubjectCode}(${room.GradeID})${index}`}
                                >
                                  <div className="flex justify-between items-center pr-3">
                                    <MiniButton
                                      width={200}
                                      height={30}
                                      buttonColor="#fff"
                                      titleColor="#4F515E"
                                      border={true}
                                      borderColor="#EDEEF3"
                                      isSelected={false}
                                      hoverable={false}
                                      handleClick={() => {}}
                                      title={`${subject.SubjectCode} ${subject.SubjectName}`}
                                    />
                                    <p className="text-sm text-[#4F515E]">
                                      จำนวน {hoursPerWeek} คาบ
                                    </p>
                                  </div>
                                </Fragment>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                  <div className="w-full pr-3 mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                      จำนวนคาบที่สอนทั้งหมด
                    </p>
                    <p className="text-sm text-gray-400">
                      {sumTeachHour(grade.Year)} คาบ
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Fragment>
        ))}
        <button
          onClick={saveData}
          className="flex w-full bg-emerald-100 hover:bg-emerald-200 duration-300 cursor-pointer h-10 rounded justify-center items-center"
        >
          <p className="text-emerald-500 text-sm">บันทึกข้อมูล</p>
        </button>
      </span>
    </>
  );
}

export default ClassroomResponsibility;
