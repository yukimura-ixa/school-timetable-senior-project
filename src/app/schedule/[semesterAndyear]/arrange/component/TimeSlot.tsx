"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
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
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
type Props = {};
// TODO: เพิ่ม Tab มุมมองแต่ละชั้นเรียน
// TODO: ลากสลับวิชาระหว่างช่อง
// TODO: ลากวิชาจากด้านบนมาทับช่องตารางแล้วจะสลับกัน
// TODO: ใส่เงื่อนไขให้ตารางสำหรับคาบพัก ให้ Timeslot มัน Disabled ระหว่างการ Drag
// TODO: ถ้าเพิ่มวิชาแบบกด ให้ส่งไปแค่ข้อมูลที่เพิ่มได้เท่านั้น เช่นกดคาบ 4 แล้วมันคือพักมอต้นก็ไม่ต้องส่งของมอต้นเข้าไป
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
    fetcher,
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
    fetcher,
  );
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
  );
  const [isActiveModal, setIsActiveModal] = useState(false);
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
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
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
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
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
  const removeSubjectSelected = () => {
    setSubjectData(() => subjectData.filter((item, index) => index != indexSelected));
    setIndexSelected(() => null)
  };
  const [isDragSubject, setIsDragSubject] = useState(false);
  const [selectTimeslotID, setSelectedTimeslotID] = useState(""); //เก็บค่า timeslotID ปลายทางที่จะนำลงไป
  const [selectedSubject, setSelectedSubject] = useState({}); //เก็บวิชาที่ Drag ลงมาในช่องตารางเพื่อส่งค่าไป
  const handleDragAndDrop = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    // const subjects = Array.from(subjectData);
    // const timeSlots = Array.from(timeSlotData.AllData);
    if (source.droppableId !== destination.droppableId) {
      //ถ้ามีการ Drag and Drop เกิดขึ้น
      setSelectedSubject(() => subjectData[source.index]); //set วิชาที่ drag ไว้
      setSubjectData(() =>
        subjectData.filter((item, index) => index !== source.index)
      ); //filter ข้อมูลออกจากหน้า Timeslot เสมือนว่ามีการเลือกข้อมูลไว้
      setSelectedTimeslotID(destination.droppableId); //set timeSlotID ปลายทางที่เรา Drop
      setIsDragSubject(true); //set state ว่าเพิ่มวิชาจากการลาก
      setIsActiveModal(true); //เปิด modal
      //ทั้งหมดนี้ใช้กับ modal จ้า
    }
    console.log(result);
  };
  const [indexSelected, setIndexSelected] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const clickToSelectSubject = (index: number) => {
    setIndexSelected(() => (index == indexSelected ? null : index)); //ถ้ามีการกดอันเดิมจะ toggle
    setSelectedSubject(() => subjectData[index]);
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
      {fetchTimeSlot.isLoading ? (
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
              <p className="text-sm" onClick={() => console.log(timeSlotData)}>
                วิชาที่สามารถจัดลงได้
              </p>
              <div className="flex w-full text-center">
                <StrictModeDroppable
                  droppableId="SUBJECTS"
                  direction="horizontal"
                >
                  {(provided, snapshot) => (
                    <div
                      className="grid w-full h-[125px] text-center grid-cols-8 overflow-y-scroll"
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
                              <>
                                {/* {!snapshot.isDragging ? setIsDragging(false) : setIsDragging(true)} */}
                                <div
                                  className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-pointer ${
                                    index == indexSelected
                                      ? "bg-green-200 hover:bg-green-300 border-green-500 animate-pulse"
                                      : "bg-white hover:bg-slate-50"
                                  } duration-100 select-none`}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                  onClick={() => clickToSelectSubject(index)}
                                >
                                  <b className="text-sm">{item.SubjectCode}</b>
                                  <p className="text-sm">
                                    {item.SubjectName.substring(0, 8)}...
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
                                </div>
                              </>
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
                          {item.Breaktime == "BREAK_BOTH" ? (
                            <td
                              className={`grid w-[100%] h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200`}
                            >
                              <b className="text-xs">
                                พักเที่ยงมัธยมต้นและปลาย
                              </b>
                            </td>
                          ) : (
                            <StrictModeDroppable
                              droppableId={`${item.TimeslotID}`}
                            >
                              {(provided, snapshot) => (
                                <td
                                  style={{
                                    backgroundColor: snapshot.isDraggingOver
                                      ? "rgb(16 185 129)"
                                      : null,
                                  }}
                                  className={`grid w-[100%] items-center cursor-pointer justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white ${
                                    indexSelected !== null && Object.keys(item.subject).length == 0
                                      ? "border-emerald-500 animate-pulse"
                                      : Object.keys(item.subject).length !== 0 ? "border-red-500" : "border-dashed"
                                  } duration-200`}
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {Object.keys(item.subject).length == 0 ? (
                                    <div
                                      onClick={() => {
                                        setIsActiveModal(true),
                                          setSelectedTimeslotID(
                                            item.TimeslotID
                                          );
                                      }}
                                    >
                                      {!snapshot.isDraggingOver &&
                                      (indexSelected !== null) ? ( //ถ้าไม่มี drag item มาอยู่ในพิ้นที่จะแสดงไอคอน หรือถ้ามีการกำลังลากวิชาหรือคลิกเลือกวิชา จะแสดงไอคอน
                                        <AddCircleIcon
                                          style={{ color: "#10b981" }}
                                          className="cursor-pointer hover:fill-emerald-600 duration-300"
                                          onClick={() => {setSelectedTimeslotID(item.TimeslotID)}}
                                        />
                                      ) : (
                                        null
                                      )}
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        className={`text-center select-none flex flex-col`}
                                      >
                                        <b className="text-sm">
                                          {item.subject.SubjectCode}
                                        </b>
                                        <b className="text-xs">
                                          {item.subject.SubjectName.substring(
                                            0,
                                            8
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
                                        style={{ color: "#ef4444" }}
                                        className="cursor-pointer hover:fill-red-600 duration-300 absolute right-[-7px] top-[-10px]"
                                      />
                                    </>
                                  )}
                                  {provided.placeholder}
                                </td>
                              )}
                            </StrictModeDroppable>
                          )}
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
