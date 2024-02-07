"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import SelectSubjectToTimeslotModal from "./SelectSubjectToTimeslotModal";
import { subject_in_slot } from "@/raw-data/subject_in_slot";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { fetcher } from "@/libs/axios";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import Loading from "@/app/loading";
import { subjectCreditValues } from "@/models/credit-value";
import { useClassData } from "@/app/_hooks/classData";
type Props = {};
// TODO: เพิ่มชื่อครูบนหน้าเว็บ
// TODO: เพิ่ม Tab มุมมองแต่ละชั้นเรียน
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
  const responsibilityData = useSWR(
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
  const [subjectData, setSubjectData] = useState([]);
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [],
    SlotAmount: [],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [],
    BreakSlot: [],
  });
  useEffect(() => {
    if (!responsibilityData.isLoading) {
      const data = responsibilityData.data; //get data
      const mapSubjectByCredit = []; //สร้าง array เปล่ามาเก็บ
      for (let i = 0; i < data.length; i++) {
        //for loop ตามข้อมูลที่มี
        for (let j = 0; j < subjectCreditValues[data[i].Credit] * 2; j++) {
          //map ตามหน่วยกิต * 2 จะได้จำนวนคาบที่ต้องลงช่องตารางจริงๆในหนึงวิชา
          mapSubjectByCredit.push(data[i]);
        }
      }
      console.log(mapSubjectByCredit);
      setSubjectData(() => mapSubjectByCredit);
    }
  }, [responsibilityData.isLoading]);
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
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
        AllData: data,
        SlotAmount: slotAmount,
        StartTime: startTime,
        Duration: duration,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }, [fetchTimeSlot.isLoading]);
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
  const [selectedSlot, setSelectedSlot] = useState({
    SlotNumber: null,
    DayOfWeek: "",
  });
  // const addSubjectToSlot = (
  //   slotNumber: number,
  //   dayOfWeek: string,
  //   subject: any,
  //   roomName: any
  // ) => {
  //   let subjectData = {
  //     SubjectCode: subject.SubjectCode,
  //     SubjectName: subject.SubjectName,
  //     RoomName: roomName,
  //   };
  //   let addSubject = timeSlotData.SlotAmounts.filter(
  //     (item) => item.DayOfWeek == dayOfWeek
  //   )[0].Slots.map((item) =>
  //     item.SlotNumber === slotNumber
  //       ? { SlotNumber: item.SlotNumber, Subject: subjectData }
  //       : item
  //   );
  //   setTimeSlotData(() => ({
  //     ...timeSlotData,
  //     SlotAmounts: [
  //       ...timeSlotData.SlotAmounts.map((item) =>
  //         item.DayOfWeek == dayOfWeek
  //           ? { DayOfWeek: item.DayOfWeek, Slots: addSubject }
  //           : item
  //       ),
  //     ],
  //   }));
  //   setIsActiveModal(false);
  // };
  // const removeSubjectToSlot = (dayOfWeek: string, slotNumber: number) => {
  //   let defaultValue = {
  //     SubjectCode: null,
  //     SubjectName: null,
  //     RoomName: null,
  //   };
  //   let removedSubject = timeSlotData.SlotAmounts.filter(
  //     (item) => item.DayOfWeek == dayOfWeek
  //   )[0].Slots.map((item) =>
  //     item.SlotNumber === slotNumber
  //       ? { SlotNumber: item.SlotNumber, Subject: defaultValue }
  //       : item
  //   );
  //   setTimeSlotData(() => ({
  //     ...timeSlotData,
  //     SlotAmounts: [
  //       ...timeSlotData.SlotAmounts.map((item) =>
  //         item.DayOfWeek == dayOfWeek
  //           ? { DayOfWeek: item.DayOfWeek, Slots: removedSubject }
  //           : item
  //       ),
  //     ],
  //   }));
  // };
  const [testDndData, setTestDndData] = useState([
    {
      name: "box",
      id: "1",
    },
    {
      name: "bottle",
      id: "2",
    },
    {
      name: "speaker",
      id: "3",
    },
  ]);
  const [emptySlot, setEmptySlot] = useState([
    {
      name: "",
      id: "DROPZONE0",
    },
    {
      name: "",
      id: "DROPZONE1",
    },
    {
      name: "",
      id: "DROPZONE2",
    },
  ]);
  // Example นะจ๊ะ
  const handleDragAndDrop = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    const items = Array.from(testDndData); //ex. [1, 2, 3]
    const items2 = Array.from(emptySlot);
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId == "ITEM") {
        const [reorderedItem] = items.splice(result.source.index, 1); //splice ออกจากตำแหน่งที่ย้าย
        items.splice(result.destination.index, 0, reorderedItem); //if 0 at second argument it's insert item
      } else {
        const [reorderedItem] = items2.splice(result.source.index, 1); //splice ออกจากตำแหน่งที่ย้าย
        items2.splice(result.destination.index, 0, reorderedItem); //if 0 at second argument it's insert item
      }
    }
    if (source.droppableId !== destination.droppableId) {
      if (source.droppableId == "ITEM") {
        let tempSource = items[source.index];
        items2.splice(destination.index, 0, tempSource);
        items.splice(source.index, 1);
      } else {
        let tempSource = items2[source.index];
        items.splice(destination.index, 0, tempSource);
        items2.splice(source.index, 1);
      }
    }
    setTestDndData(items);
    setEmptySlot(items2);
    console.log(result);
  };
  const dragAndDropSubject = (result) => {
    const { source, destination, type } = result;
    const subjects = Array.from(testDndData); //รายวิชาที่ลงได้
    const timeSlot = Array.from(emptySlot); //ช่องตาราง
    if (!destination) return;

    if (source.droppableId !== destination.droppableId) {
      if (source.droppableId == "SUBJECT") {
        let tempSource = subjects[source.index];
        setEmptySlot(() =>
          timeSlot.map((item, index) =>
            item.id === destination.droppableId
              ? { id: item.id, name: tempSource.name }
              : item
          )
        );
        setTestDndData(() =>
          subjects.filter((item, index) => index !== source.index)
        );
      } else if (
        source.droppableId.substring(0, 8) == "DROPZONE" &&
        source.droppableId.substring(0, 8) == "DROPZONE"
      ) {
        let tempSource = emptySlot.filter(
          (item) => item.id == source.droppableId
        )[0]; //เอาค่าของ source
        let tempDestination = emptySlot.filter(
          (item) => item.id == destination.droppableId
        )[0]; //เอาค่าของ destination มาเก็บไว้
        let map1 = emptySlot.map((item) =>
          item.id == source.droppableId
            ? tempSource
            : item.id == destination.droppableId
              ? tempDestination
              : item
        ); //map item ตามเงื่อนไข
        setEmptySlot(() => map1); //set state
      }
    }
  };
  return (
    <>
      {isActiveModal ? (
        <SelectSubjectToTimeslotModal
          AddSubjectToSlot={undefined}
          CloseModal={() => setIsActiveModal(false)}
          SlotNumber={selectedSlot.SlotNumber}
          DayOfWeek={selectedSlot.DayOfWeek}
        />
      ) : null}
      {/* React dnd test */}
      {/* <div className="w-[300px] flex flex-col gap-3">
        <DragDropContext onDragEnd={dragAndDropSubject}>
          <div className="">
            <p onClick={() => console.log(timeSlotData.BreakSlot)}>List Item</p>
          </div>
          <div className="flex flex-col w-full border border-[#EDEEF3] p-4 gap-4">
            <p className="text-sm">วิชาที่สามารถจัดลงได้</p>
            <div className="flex w-full text-center">
              <Droppable droppableId="SUBJECT" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    className={`flex w-full text-center`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {testDndData.map((item, index) => (
                      <Draggable
                        draggableId={item.id}
                        key={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            className={`flex flex-col mx-1 py-2 text-sm w-[70px] h-[60px] rounded border duration-300 border-[#EDEEF3] cursor-pointer select-none ${snapshot.isDragging ? "bg-green-300" : "bg-white"
                              }`}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <p>{item.name}</p>
                            <p>{item.id}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
          <div className="flex flex-col w-full border border-[#EDEEF3] p-4 gap-4">
            <p className="text-sm">Empty box</p>
            <div className="flex w-full gap-3 text-center">
              {emptySlot.map((item, index) => (
                <Droppable droppableId={`${item.id}`}>
                  {(provided, snapshot) => (
                    <div
                      className={`flex flex-col text-sm w-[70px] h-[60px] hover:bg-emerald-300 duration-300 items-center justify-center bg-white rounded border border-[#EDEEF3] cursor-pointer select-none`}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {!item.name ? (
                        <p>Dropzone</p>
                      ) : (
                        <Draggable
                          draggableId={item.id}
                          key={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="flex w-full text-xs justify-center items-center border bg-white"
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                            >
                              <div>{item.name}</div>
                            </div>
                          )}
                        </Draggable>
                      )}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div> */}
      {fetchTimeSlot.isLoading ? (
        <Loading />
      ) : (
        <DragDropContext onDragEnd={handleDragAndDrop}>
          <div className="flex flex-col w-full border border-[#EDEEF3] p-4 gap-4 mt-4">
            <p
              className="text-sm"
              onClick={() => console.log(responsibilityData.data)}
            >
              วิชาที่สามารถจัดลงได้
            </p>
            <div className="flex w-full text-center">
              <Droppable droppableId="asdasds" direction="horizontal">
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
                              className="w-[90%] my-1 p-2 border rounded cursor-pointer bg-white hover:bg-slate-50 duration-300 select-none"
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                            >
                              <p className="text-sm">{item.SubjectCode}</p>
                              <p className="text-sm">
                                {item.SubjectName.substring(0, 9)}
                              </p>
                              <p className="text-sm">{item.GradeID}</p>
                            </div>
                          )}
                        </Draggable>
                      </Fragment>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
          <table className="table-auto w-full flex flex-col gap-3 mt-4">
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
                <Fragment key={`asdasda${day.Day}`}>
                  <tr className="flex gap-4">
                    <td
                      className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
                      style={{ backgroundColor: day.BgColor }}
                    >
                      <span className={`flex w-[50px] h-[24px] justify-center`}>
                        <p style={{ color: day.TextColor }}>{day.Day}</p>
                      </span>
                    </td>
                    {timeSlotData.AllData.filter(
                      (item) => dayOfWeekThai[item.DayOfWeek] == day.Day
                    ).map((item, index) => (
                      <Fragment key={`DROPZONE${item.TimeslotID}`}>
                        <Droppable droppableId={`${item.TimeslotID}`}>
                          {(provided, snapshot) => (
                            <td
                              className="flex font-light grow items-center justify-center p-[10px] h-[76px] rounded border border-[#ABBAC1] cursor-pointer bg-white hover:bg-emerald-200 hover:border-emerald-500 duration-300"
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              <p className="text-sm">{item.TimeslotID}</p>
                              {provided.placeholder}
                            </td>
                          )}
                        </Droppable>
                      </Fragment>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </DragDropContext>
      )}
    </>
  );
}

export default TimeSlot;
