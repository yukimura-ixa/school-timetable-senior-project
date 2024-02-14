"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import SelectSubjectToTimeslotModal from "./SelectSubjectToTimeslotModal";
import { subject_in_slot } from "@/raw-data/subject_in_slot";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import { fetcher } from "@/libs/axios";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import Loading from "@/app/loading";
import { subjectCreditValues } from "@/models/credit-value";
import { useClassData } from "@/app/_hooks/classData";
import { teacher } from "@prisma/client";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
type Props = {};
// TODO: เพิ่ม Tab มุมมองแต่ละชั้นเรียน
// TODO: ลากสลับวิชาระหว่างช่อง
// TODO: ลากวิชาจากด้านบนมาทับช่องตารางแล้วจะสลับกัน
function TimeSlot(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const searchTeacherID = useSearchParams().get("TeacherID");
  const searchGradeID = useSearchParams().get("GradeID");
  const classData = useClassData(
    parseInt(academicYear),
    parseInt(semester),
    parseInt(searchTeacherID)
  );
  const fetchTeacher = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/teacher?TeacherID=` + searchTeacherID,
    fetcher
  );
  const fetchAllSubject = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () =>
      `/assign?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester +
      `&TeacherID=` +
      searchTeacherID,
    fetcher
  );
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher
  );
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [isDragSubject, setIsDragSubject] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [teacherData, setTeacherData] = useState<teacher>({
    Firstname: "",
    Lastname: "",
    Department: "",
    Prefix: "",
    TeacherID: null,
  });
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [],
    SlotAmount: [],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [],
    BreakSlot: [],
  });
  useEffect(() => {
    if (!fetchTeacher.isValidating) {
      setTeacherData(() => fetchTeacher.data);
    }
  }, [fetchTeacher.isValidating]);
  useEffect(() => {
    if (!fetchAllSubject.isValidating) {
      const data = fetchAllSubject.data; //get data
      const mapSubjectByCredit = []; //สร้าง array เปล่ามาเก็บ
      for (let i = 0; i < data.length; i++) {
        //for loop ตามข้อมูลที่มี
        for (let j = 0; j < subjectCreditValues[data[i].Credit] * 2; j++) {
          //map ตามหน่วยกิต * 2 จะได้จำนวนคาบที่ต้องลงช่องตารางจริงๆในหนึงวิชา
          mapSubjectByCredit.push(data[i]);
        }
      }
      let s = {
        RespID: 1,
        TeacherID: 1,
        GradeID: "101",
        SubjectCode: "ก20991",
        AcademicYear: 2566,
        Semester: "SEMESTER_1",
        TeachHour: 1,
        subject: {
          SubjectCode: "ก20991",
          SubjectName: "พืชผักสวนครัว",
          Credit: "CREDIT_15",
          Category: "กิจกรรม",
          ProgramID: null,
        },
        gradelevel: {
          GradeID: "101",
          Year: 1,
          Number: 1,
          ProgramID: null,
        },
        teacher: {
          TeacherID: 1,
          Prefix: "นาย",
          Firstname: "พูลศักดิ์",
          Lastname: "พ่อบุตรดี",
          Department: "การงานอาชีพและเทคโนโลยี",
        },
        SubjectName: "พืชผักสวนครัว",
        Credit: "CREDIT_15",
      }; //ข้อมูลจำลองในกรณีที่ข้อมูลไม่โหลด
      setSubjectData(() => mapSubjectByCredit);
      console.log(mapSubjectByCredit);
    }
  }, [fetchAllSubject.isValidating]);
  useEffect(() => {
    if (!fetchTimeSlot.isValidating) {
      let data = fetchTimeSlot.data;
      let dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: "#fff",
          BgColor: "#000",
        })); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      let slotAmount = data
        .filter((item) => item.DayOfWeek == "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      let breakTime = data
        .filter(
          (item) =>
            (item.Breaktime == "BREAK_BOTH" ||
              item.Breaktime == "BREAK_JUNIOR" ||
              item.Breaktime == "BREAK_SENIOR") &&
            item.DayOfWeek == "MON" //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) =>
          parseInt(item.TimeslotID.substring(item.TimeslotID.length - 1))
        ); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      let startTime = {
        Hours: new Date(data[0].StartTime).getHours() - 7, //พอแปลงมันเอาเวลาของ indo เลย -7 กลับไป
        Minutes: new Date(data[0].StartTime).getMinutes(),
      };
      let duration = getMinutes(
        new Date(data[0].EndTime).getTime() -
          new Date(data[0].StartTime).getTime()
      ); //เอาเวลาจบลบเริ่มจะได้ duration
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        StartTime: startTime,
        Duration: duration,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }, [fetchTimeSlot.isValidating]);
  const getMinutes = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    return minutes;
  };
  const addHours = (time: Date, hours: number): Date => {
    //set เวลาด้วยการบวกตาม duration และคูณ hours ถ้าจะให้ skip ไปหลายชั่วโมง
    time.setMinutes(time.getMinutes() + timeSlotData.Duration * hours);
    return time;
  };
  const mapTime = () => {
    let map = [
      ...timeSlotData.SlotAmount.map((hour) => {
        //สร้าง format เวลา ตัวอย่าง => 2023-07-27T17:24:52.897Z
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${
          timeSlotData.StartTime.Minutes == 0
            ? "00"
            : timeSlotData.StartTime.Minutes
        }`;
        //แยก เวลาเริ่มกับเวลาจบไว้ตัวแปรละอัน
        const timeStart = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        const timeEnd = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        //นำไปใส่ใน function addHours เพื่อกำหนดเวลาเริ่ม-จบ
        let start = addHours(timeStart, hour - 1); //เวลาเริ่มใส่ hours-1 เพราะคาบแรกไม่ต้องการให้บวกเวลา
        let end = addHours(timeEnd, hour); //จะต้องมากกว่า start ตาม duration ที่กำหนดไว้
        //แปลงจาก 2023-07-27T17:24:52.897Z เป็น 17:24 โดยใช้ slice
        return {
          Start: start.toISOString().slice(11, 16),
          End: end.toISOString().slice(11, 16),
        };
      }),
    ];
    return map;
  };
  const [selectTimeslotID, setSelectedTimeslotID] = useState("");
  const [selectedSubject, setSelectedSubject] = useState({});
  const addSubjectToSlot = (subject: object, timeSlotID: string) => {
    let data = timeSlotData.AllData;
    //แค่ลบออกได้อย่างเดียวอยู่ตอนนี้ 2/8/2024
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: subject } : item
      ),
    }));
    setSelectedSubject({});
    setIsActiveModal(false);
  };
  const removeSubjectFromSlot = (timeSlotID: string, subject: object) => {
    let data = timeSlotData.AllData;
    returnSubject(subject);
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: {} } : item
      ),
    }));
  };
  const returnSubject = (subject: object) => {
    setSubjectData(() => [...subjectData, subject]);
  };
  const removeSubjectSelected = (newSubjectData: Array<object>) => {
    setSubjectData(() => newSubjectData);
  };
  const handleDragAndDrop = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    const subjects = Array.from(subjectData);
    const timeSlots = Array.from(timeSlotData.AllData);
    if (source.droppableId !== destination.droppableId) {
      //ถ้ามีการหย่อนวิชาลง timeSlot (droppableId ต้นทางและปลายทางไม่เหมือนกัน)
      // setTimeSlotData(() => ({
      //   ...timeSlotData,
      //   AllData: timeSlots.map((data) =>
      //     destination.droppableId == data.TimeslotID
      //       ? { ...data, subject: subjects[source.index] }
      //       : data
      //   ),
      // }));
      setSelectedSubject(() => subjectData[source.index]); //set วิชาที่ drag
      setSubjectData(() =>
        subjectData.filter((item, index) => index !== source.index)
      );
      setSelectedTimeslotID(destination.droppableId); //set timeSlotID ปลายทาง
      setIsDragSubject(true); //set state ว่าเพิ่มวิชาจากการลาก
      setIsActiveModal(true); //เปิด modal
      //ทั้งหมดนี้ใช้กับ modal จ้า
    }
    // console.log(result);
  };
  return (
    <>
      {isActiveModal ? (
        <SelectSubjectToTimeslotModal
          AddSubjectToSlot={addSubjectToSlot}
          CloseModal={() => setIsActiveModal(false)}
          timeSlotID={selectTimeslotID}
          subjects={subjectData}
          fromDnd={isDragSubject}
          subjectSelected={selectedSubject}
          setIsDragState={() => setIsDragSubject(false)}
          returnSubject={returnSubject}
          removeSubjectSelected={removeSubjectSelected}
        />
      ) : null}
      {fetchTimeSlot.isValidating ? (
        <Loading />
      ) : (
        <>
          <div className="p-4 mt-4 flex gap-3">
            <p className="text-sm">ตารางสอนของ</p>
            <p className="text-sm font-bold">
              คุณครู {teacherData.Firstname} {teacherData.Lastname}
            </p>
          </div>
          <DragDropContext onDragEnd={handleDragAndDrop}>
            <div className="flex flex-col w-full border border-[#EDEEF3] p-4 gap-4 mt-4">
              <p
                className="text-sm"
                onClick={() => console.log(timeSlotData.AllData)}
              >
                วิชาที่สามารถจัดลงได้
              </p>
              <div className="flex w-full text-center">
                <StrictModeDroppable
                  droppableId="SUBJECTS"
                  direction="horizontal"
                >
                  {(provided, snapshot) => (
                    <div
                      className="grid w-full text-center grid-cols-8 overflow-x-scroll"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {subjectData.map((item, index) => (
                        <Fragment
                          key={`${item.SubjectCode}-${item.GradeID}-${index}`}
                        >
                          <Draggable
                            draggableId={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                            key={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className="w-[85%] flex flex-col my-1 py-1 border rounded cursor-pointer bg-white hover:bg-slate-50 duration-300 select-none"
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                              >
                                <b className="text-sm">{item.SubjectCode}</b>
                                <p className="text-sm">
                                  {item.SubjectName.substring(0, 9)}...
                                </p>
                                <b className="text-xs">
                                  ม.{item.GradeID[0]}/
                                  {parseInt(item.GradeID.substring(1, 2)) < 10
                                    ? item.GradeID[2]
                                    : item.GradeID.substring(1, 2)}
                                </b>
                                <p className="text-xs">
                                  {teacherData.Firstname}
                                </p>
                                {/* <p className="text-sm">{teacherData.Firstname}</p> */}
                              </div>
                            )}
                          </Draggable>
                        </Fragment>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </div>
            </div>
            <table className="table-auto w-full flex flex-col gap-3 mt-4 mb-10">
              <thead>
                <tr className="flex gap-4">
                  <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
                    <span className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center">
                      คาบที่
                    </span>
                  </th>
                  {/* Map จำนวนคาบ */}
                  {timeSlotData.SlotAmount.map((item) => (
                    <Fragment key={`woohoo${item}`}>
                      <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
                        <p className="text-gray-600">
                          {item < 10 ? `0${item}` : item}
                        </p>
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="flex flex-col gap-3">
                <tr className="flex gap-4">
                  <td className="flex items-center bg-gray-100 justify-center p-[10px] h-[40px] rounded">
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p className="text-gray-600">เวลา</p>
                    </span>
                  </td>
                  {/* Map duration ของคาบเรียน */}
                  {mapTime().map((item) => (
                    <Fragment key={`woohoo${item.Start}${item.End}`}>
                      <td className="flex grow items-center justify-center py-[10px] h-[40px] rounded bg-gray-100 select-none">
                        <p className="flex text-xs w-full items-center justify-center h-[24px] text-gray-600">
                          {item.Start}-{item.End}
                        </p>
                      </td>
                    </Fragment>
                  ))}
                </tr>
                {timeSlotData.DayOfWeek.map((day) => (
                  <Fragment key={`Day-${day.Day}`}>
                    <tr className="flex gap-4">
                      <td
                        className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
                        style={{ backgroundColor: day.BgColor }}
                      >
                        <span
                          className={`flex w-[50px] h-[24px] justify-center`}
                        >
                          <p style={{ color: day.TextColor }}>{day.Day}</p>
                        </span>
                      </td>
                      {timeSlotData.AllData.filter(
                        (item) => dayOfWeekThai[item.DayOfWeek] == day.Day
                      ).map((item, index) => (
                        <Fragment key={`DROPZONE${item.TimeslotID}`}>
                          <StrictModeDroppable
                            droppableId={`${item.TimeslotID}`}
                          >
                            {(provided, snapshot) => (
                              <td
                                className={`grid w-[100%] items-center cursor-pointer justify-center h-[76px] rounded border relative border-[#ABBAC1] bg-white ${
                                  snapshot.isDraggingOver
                                    ? "bg-emerald-300 border-emerald-500 animate-pulse"
                                    : null
                                } duration-200`}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {Object.keys(item.subject).length == 0 ? (
                                  <div
                                    onClick={() => {
                                      setIsActiveModal(true),
                                        setSelectedTimeslotID(item.TimeslotID);
                                    }}
                                  >
                                    {snapshot.isDraggingOver ? (
                                      ""
                                    ) : (
                                      <AddCircleIcon className="cursor-pointer fill-emerald-500 hover:fill-emerald-600 duration-300" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex gap-3 items-center">
                                    <div className="text-center select-none flex flex-col">
                                      <b className="text-sm">
                                        {item.subject.SubjectCode}
                                      </b>
                                      <b className="text-xs">
                                        {item.subject.SubjectName.substring(
                                          0,
                                          9
                                        )}
                                        ...
                                      </b>
                                      <b className="text-xs">
                                        ม.{item.subject.GradeID[0]}/
                                        {parseInt(
                                          item.subject.GradeID.substring(1, 2)
                                        ) < 10
                                          ? item.subject.GradeID[2]
                                          : item.subject.GradeID.substring(
                                              1,
                                              2
                                            )}
                                      </b>
                                      <p className="text-xs">
                                        {/* {teacherData.Firstname} */}
                                        ห้อง {item.subject.RoomID}
                                      </p>
                                    </div>
                                    <RemoveCircleIcon
                                      onClick={() =>
                                        removeSubjectFromSlot(
                                          item.TimeslotID,
                                          item.subject
                                        )
                                      }
                                      className="cursor-pointer fill-red-500 hover:fill-red-600 duration-300 absolute right-[-7px] top-[-10px]"
                                    />
                                  </div>
                                )}
                                {provided.placeholder}
                              </td>
                            )}
                          </StrictModeDroppable>
                        </Fragment>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </DragDropContext>
        </>
      )}
    </>
  );
}

export default TimeSlot;
