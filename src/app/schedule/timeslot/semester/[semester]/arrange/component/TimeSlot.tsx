"use client";
import axios from "axios";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import SelectSubjectToTimeslotModal from "./SelectSubjectToTimeslotModal";
import { subject_in_slot } from "@/raw-data/subject_in_slot";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
// import Draggable, {DraggableCore} from 'react-draggable'; // Both at the same time
type Props = {};

function TimeSlot(props: Props) {
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [timeSlotData, setTimeSlotData] = useState({
    SlotAmount: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    SlotAmounts: subject_in_slot,
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [
      { Day: "จันทร์", TextColor: "#b8a502", BgColor: "#fffacf" },
      { Day: "อังคาร", TextColor: "#d800db", BgColor: "#fedbff" },
      { Day: "พุธ", TextColor: "#1cba00", BgColor: "#e1ffdb" },
      { Day: "พฤหัส", TextColor: "#ba4e00", BgColor: "#ffb996" },
      { Day: "ศุกร์", TextColor: "#0099d1", BgColor: "#bdedff" },
    ],
    BreakSlot: [4, 5],
  });
  const addHours = (time: Date, hours: number): Date => {
    //set เวลาด้วยการบวกตาม duration และคูณ hours ถ้าจะให้ skip ไปหลายชั่วโมง
    time.setMinutes(time.getMinutes() + timeSlotData.Duration * hours);
    return time;
  };
  const mapTime = () => {
    let map = [
      ...timeSlotData.SlotAmount.map((hour) => {
        //สร้าง format เวลา ตัวอย่าง => 2023-07-27T17:24:52.897Z
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${timeSlotData.StartTime.Minutes}`;
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
  const addSubjectToSlot = (
    slotNumber: number,
    dayOfWeek: string,
    subject: any,
    roomName: any
  ) => {
    let subjectData = {
      SubjectCode: subject.SubjectCode,
      SubjectName: subject.SubjectName,
      RoomName: roomName,
    };
    let addSubject = timeSlotData.SlotAmounts.filter(
      (item) => item.DayOfWeek == dayOfWeek
    )[0].Slots.map((item) =>
      item.SlotNumber === slotNumber
        ? { SlotNumber: item.SlotNumber, Subject: subjectData }
        : item
    );
    setTimeSlotData(() => ({
      ...timeSlotData,
      SlotAmounts: [
        ...timeSlotData.SlotAmounts.map((item) =>
          item.DayOfWeek == dayOfWeek
            ? { DayOfWeek: item.DayOfWeek, Slots: addSubject }
            : item
        ),
      ],
    }));
    setIsActiveModal(false);
  };
  const removeSubjectToSlot = (dayOfWeek: string, slotNumber: number) => {
    let defaultValue = {
      SubjectCode: null,
      SubjectName: null,
      RoomName: null,
    };
    let removedSubject = timeSlotData.SlotAmounts.filter(
      (item) => item.DayOfWeek == dayOfWeek
    )[0].Slots.map((item) =>
      item.SlotNumber === slotNumber
        ? { SlotNumber: item.SlotNumber, Subject: defaultValue }
        : item
    );
    setTimeSlotData(() => ({
      ...timeSlotData,
      SlotAmounts: [
        ...timeSlotData.SlotAmounts.map((item) =>
          item.DayOfWeek == dayOfWeek
            ? { DayOfWeek: item.DayOfWeek, Slots: removedSubject }
            : item
        ),
      ],
    }));
  };
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
    const subjects = Array.from(testDndData) //รายวิชาที่ลงได้
    const timeSlot = Array.from(emptySlot) //ช่องตาราง
    if (!destination) return;

    if(source.droppableId !== destination.droppableId){
      let tempSource = subjects[source.index]
      let desIndex = destination.droppableId.substring(8);
      console.log(desIndex)
      timeSlot.splice(desIndex, 1, tempSource) //replace วิชาลงในช่องว่าง
      subjects.splice(source.index, 1);
    }
    setTestDndData(subjects);
    setEmptySlot(timeSlot);
    console.log(result)
  }
  return (
    <>
      {isActiveModal ? (
        <SelectSubjectToTimeslotModal
          AddSubjectToSlot={addSubjectToSlot}
          CloseModal={() => setIsActiveModal(false)}
          SlotNumber={selectedSlot.SlotNumber}
          DayOfWeek={selectedSlot.DayOfWeek}
        />
      ) : null}
      {/* React dnd test */}
      <div className="w-[300px] flex flex-col gap-3">
        <DragDropContext onDragEnd={dragAndDropSubject}>
          <div className="">
            <p>List Item</p>
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
                            className={`flex flex-col mx-1 py-2 text-sm w-full h-[60px] bg-white rounded border border-[#EDEEF3] cursor-pointer select-none ${
                              snapshot.isDragging
                                ? "bg-orange-300"
                                : "bg-red-200"
                            }`}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <p>{item.name}</p>
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
                      className={`flex flex-col py-2 text-sm w-[70px] h-[60px] bg-white rounded border border-[#EDEEF3] cursor-pointer select-none`}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {/* {emptySlot.map((item, index) => (
                      <Draggable draggableId={item.id} key={item.id} index={index}>
                        {(provided) => (
                          <div className="w-full h-10 my-2 bg-gray-200 border justify-center items-center" {...provided.dragHandleProps} {...provided.draggableProps} ref={provided.innerRef}>
                            <p>{item.name}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder} */}
                      <p>{!item.name ? "Dropzone" : item.name}</p>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>
      <table className="table-auto w-full flex flex-col gap-3">
        <thead>
          <tr className="flex gap-4">
            <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
              <span className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center">
                คาบที่
              </span>
            </th>
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
                {timeSlotData.SlotAmounts.filter(
                  (item) => item.DayOfWeek == day.Day
                )[0].Slots.map((item) => (
                  <Fragment key={`woohoo${item.SlotNumber}`}>
                    <td className="flex font-light grow items-center justify-center p-[10px] h-[76px] rounded border border-[#ABBAC1] cursor-pointer">
                      <span className="flex w-[50px] flex-col items-center text-xs duration-300">
                        {timeSlotData.BreakSlot.includes(item.SlotNumber) ? (
                          <span className="flex w-[50px] h-[24px] flex-col items-center text-sm duration-300">
                            {/* <MdAdd size={20} className="fill-gray-300" /> */}
                          </span>
                        ) : item.Subject.SubjectCode != null ? (
                          <>
                            <div className="flex items-center">
                              <div>
                                <p>{item.Subject.SubjectCode}</p>
                                <p>ม.1/2</p>
                                <p>{item.Subject.RoomName}</p>
                              </div>
                              <MdDelete
                                onClick={() => {
                                  removeSubjectToSlot(day.Day, item.SlotNumber);
                                }}
                                size={20}
                                className="fill-red-400 hover:fill-red-500 duration-300"
                              />
                            </div>
                          </>
                        ) : (
                          // <MdAdd
                          //   onClick={() => {
                          //     setIsActiveModal(true);
                          //     setSelectedSlot(() => ({
                          //       SlotNumber: item.SlotNumber,
                          //       DayOfWeek: day.Day,
                          //     }));
                          //   }}
                          //   size={20}
                          //   className="fill-gray-300"
                          // />
                          <p>{item.SlotNumber}</p>
                        )}
                      </span>
                    </td>
                  </Fragment>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default TimeSlot;

// {timeSlotData.BreakSlot.includes(item) ? (
//   <span className="flex w-[50px] h-[24px] flex-col items-center text-sm hover:text-lg duration-300">
//     {/* <MdAdd size={20} className="fill-gray-300" /> */}
//   </span>
// ) : (
//   <span
//     onClick={() => {
//       setIsActiveModal(true)
//       setSelectedSlot(() => (
//         {
//           SlotNumber: item,
//           DayOfWeek: day.Day,
//         }
//       ));
//     }}
//     className="flex w-[50px] flex-col items-center text-xs hover:w-[75px] hover:text-lg duration-300"
//   >
//     <MdAdd size={20} className="fill-gray-300" />
//     {/* <p>ค22101</p>
//     <p>อัครเดช</p>
//     <p>ภาษาไทย</p> */}
//   </span>
// )}
