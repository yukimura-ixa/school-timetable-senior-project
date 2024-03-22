"use client";
import React, { Fragment } from "react";
import { Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HttpsIcon from "@mui/icons-material/Https";
import TimetableHeader from "./TimetableHeader";
import TimetableRow from "./TimetableRow";
type Props = {
  timeSlotData: any[];
  mapTime: Function;
  checkBreakTime: Function;
  isSelectedToAdd: Function;
  isSelectedToChange: Function;
  checkRelatedYearDuringDragging: Function;
  timeSlotCssClassName: Function;
  storeSelectedSubject: object;
  addRoomModal: Function;
  changeTimeSlotSubject: object;
  clickOrDragToChangeTimeSlot: Function;
  isCilckToChangeSubject: boolean;
  timeslotIDtoChange: object;
  dropOutOfZone: Function;
  displayErrorChangeSubject: Function;
  showErrorMsgByTimeslotID: string;
  removeSubjectFromSlot: Function;
  showLockDataMsgByTimeslotID: string;
  setShowErrorMsgByTimeslotID: Function;
  setShowLockDataMsgByTimeslotID: Function;
};

//! แสดงเวลาไม่ถูก
// TODO: เสริม => เลือกห้องใส่วิชาไปเลยเพื่อความสะดวก

function TimeSlot({
  timeSlotData,
  checkBreakTime,
  isSelectedToAdd,
  checkRelatedYearDuringDragging,
  timeSlotCssClassName,
  isSelectedToChange,
  storeSelectedSubject,
  addRoomModal,
  changeTimeSlotSubject,
  clickOrDragToChangeTimeSlot,
  isCilckToChangeSubject,
  timeslotIDtoChange,
  dropOutOfZone,
  displayErrorChangeSubject,
  showErrorMsgByTimeslotID,
  removeSubjectFromSlot,
  showLockDataMsgByTimeslotID,
  setShowLockDataMsgByTimeslotID,
  setShowErrorMsgByTimeslotID
}: Props) {
  return (
    <>
      <table className="table-auto w-full flex flex-col gap-3 mt-4 mb-10">
        <thead className="flex flex-col gap-3">
          <TimetableHeader timeslot={timeSlotData}/>
        </thead>
        <tbody className="flex flex-col gap-3">
          {timeSlotData.DayOfWeek.map((day) => (
            <Fragment key={`Day-${day.Day}`}>
              <tr className="flex gap-4">
                <TimetableRow day={day} />
                {timeSlotData.AllData.filter(
                  (item) => dayOfWeekThai[item.DayOfWeek] == day.Day,
                ).map((item, index) => (
                  <Fragment key={`DROPZONE${item.TimeslotID}`}>
                    <StrictModeDroppable
                      //จะลากลงไม่ได้ก็ต่อเมื่อเป็นคาบพักและเป็นวิชาที่มีอยู่ใน slot แล้ว (ไม่รวมสลับวิชาระหว่างช่อง)
                      isDropDisabled={
                        //ถ้ามีพักเที่ยงก็ปิดช่องเลย
                        checkBreakTime(item.Breaktime) ||
                        item.subject.Scheduled ||
                        //ถ้าเป็นวิชาล็อก GradeID จะเป็น array
                        (typeof item.subject.GradeID !== "string" &&
                          Object.keys(item.subject).length !== 0) ||
                        //ถ้าลากเพิ่มวิชา ต้องลากลงได้แค่ช่องว่างเท่านั้น
                        (isSelectedToAdd() &&
                          Object.keys(item.subject).length !== 0) ||
                        //ถ้าลากในออกนอก ให้เช็คว่าคาบ NOT_BREAK ที่มีวิชา related กับ yearSelected ไหม
                        (item.Breaktime == "NOT_BREAK" &&
                        Object.keys(item.subject).length !== 0
                          ? checkRelatedYearDuringDragging(
                              item.subject.gradelevel.Year,
                            )
                          : false)
                      }
                      droppableId={`${item.TimeslotID}`}
                    >
                      {(provided, snapshot) => (
                        <td
                          style={{
                            backgroundColor: snapshot.isDraggingOver
                              ? "white"
                              : null,
                            width: `${
                              1062 / timeSlotData.SlotAmount.length - 10
                            }px`,
                          }}
                          className={timeSlotCssClassName(
                            item.Breaktime,
                            item.subject,
                          )}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          // onClick={() => console.log(item)}
                        >
                          {Object.keys(item.subject).length === 0 ? ( //ถ้าไม่มีวิชาใน timeslot
                            //ถ้ายังไม่กดเลือกวิชาจะซ่อนปุ่ม + เอาไว้
                            <>
                              <div
                                style={{
                                  display:
                                    checkBreakTime(item.Breaktime) &&
                                    (isSelectedToAdd() || isSelectedToChange())
                                      ? "flex"
                                      : "none",
                                }}
                                className="flex-col"
                              >
                                <b className="text-sm">พัก</b>
                                <p className="text-sm">
                                  {item.Breaktime == "BREAK_JUNIOR"
                                    ? "มัธยมต้น"
                                    : item.Breaktime == "BREAK_SENIOR" ? "มัธยมปลาย" : "กลางวัน"}
                                </p>
                              </div>
                              <AddCircleIcon
                                style={{
                                  color: "#10b981",
                                  display:
                                    Object.keys(storeSelectedSubject).length ==
                                      0 ||
                                    checkBreakTime(item.Breaktime) ||
                                    snapshot.isDraggingOver
                                      ? "none"
                                      : "flex",
                                }}
                                className={`cursor-pointer hover:fill-emerald-600 duration-300 animate-pulse`}
                                onClick={() => addRoomModal(item.TimeslotID)} //เพิ่ม timeslotID ที่เลือกไว้ลงไป
                              />
                              <ChangeCircleIcon
                                style={{
                                  color: "#345eeb",
                                  display:
                                    Object.keys(changeTimeSlotSubject).length ==
                                      0 || checkBreakTime(item.Breaktime)
                                      ? "none"
                                      : "flex",
                                }}
                                className={`cursor-pointer hover:fill-blue-600 duration-300 animate-pulse rotate-90`}
                                onClick={() =>
                                  clickOrDragToChangeTimeSlot(
                                    item.subject,
                                    item.TimeslotID,
                                    true,
                                  )
                                }
                              />
                            </>
                          ) : (
                            //ถ้ามีวิชาอยู่ใน timeslot
                            <>
                              <Draggable
                                isDragDisabled={
                                  (isCilckToChangeSubject &&
                                    item.TimeslotID !==
                                      timeslotIDtoChange.source) ||
                                  typeof item.subject.GradeID !== "string" ||
                                  item.subject.Scheduled
                                } //true ถ้าเราสลับวิชาด้วยการกด จะไปลากอันอื่นไม่ได้นอกจากลากอันที่เคยกดเลือกไว้
                                draggableId={`Slot-${item.TimeslotID}-Index-${index}`}
                                key={`Slot-${item.TimeslotID}-Index-${index}`}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  if (snapshot.isDropAnimating) {
                                    //เช็คว่ามีการปล่อยเมาส์มั้ย
                                    dropOutOfZone(item.subject); //ถ้ามีก็เรียกใช้ฟังก์ชั่นพร้อมส่งวิชาที่เลือกลงไป
                                  }
                                  return (
                                    <>
                                      <div
                                        // style={{
                                        //   display:
                                        //     Object.keys(item.subject)
                                        //       .length == 0
                                        //       ? "none"
                                        //       : "flex",
                                        // }}
                                        className={`text-center select-none flex flex-col ${
                                          snapshot.isDragging
                                            ? "w-fit h-fit bg-white rounded"
                                            : ""
                                        }`}
                                        {...provided.dragHandleProps}
                                        {...provided.draggableProps}
                                        ref={provided.innerRef}
                                      >
                                        <b className="text-sm">
                                          {item.subject.SubjectCode}
                                        </b>
                                        <b className="text-xs">
                                          {item.subject.SubjectName.substring(
                                            0,
                                            8,
                                          )}
                                          ...
                                        </b>
                                        <b style={{display : item.subject.IsLocked ? 'none' : 'flex', justifyContent : 'center'}} className="text-xs">
                                          {typeof item.subject.GradeID !==
                                          "string"
                                            ? null
                                            : `ม.${item.subject.GradeID[0]}/${
                                                parseInt(item.subject.GradeID.substring(1))
                                              }`}
                                        </b>
                                        <p className="text-xs">
                                          ห้อง {item.subject.RoomName}
                                        </p>
                                      </div>
                                      <ChangeCircleIcon
                                        onClick={() => {
                                          clickOrDragToChangeTimeSlot(
                                            item.subject,
                                            item.TimeslotID,
                                            true,
                                          );
                                        }}
                                        style={{
                                          color:
                                            item.TimeslotID ==
                                            timeslotIDtoChange.source
                                              ? "#fcba03"
                                              : "#2563eb",
                                          display:
                                            Object.keys(storeSelectedSubject)
                                              .length !== 0 ||
                                            typeof item.subject.GradeID !==
                                              "string"
                                              ? "none"
                                              : item.subject.Scheduled
                                                ? "none"
                                                : displayErrorChangeSubject(
                                                      item.Breaktime,
                                                      item.subject.gradelevel
                                                        .Year,
                                                    )
                                                  ? "none"
                                                  : "flex",
                                        }}
                                        className={`cursor-pointer ${
                                          item.TimeslotID ==
                                          timeslotIDtoChange.source
                                            ? "hover:fill-amber-500 animate-pulse"
                                            : "hover:fill-blue-700"
                                        } bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px] rotate-90`}
                                      />
                                      <ErrorIcon
                                        onMouseEnter={() =>
                                          setShowErrorMsgByTimeslotID(
                                            item.TimeslotID,
                                          )
                                        }
                                        onMouseLeave={() =>
                                          setShowErrorMsgByTimeslotID("")
                                        }
                                        style={{
                                          color: "#ef4444",
                                          display:
                                            Object.keys(storeSelectedSubject)
                                              .length !== 0 ||
                                            typeof item.subject.GradeID !==
                                              "string"
                                              ? "none"
                                              : item.subject.Scheduled
                                                ? "none"
                                                : displayErrorChangeSubject(
                                                      item.Breaktime,
                                                      item.subject.gradelevel
                                                        .Year,
                                                    )
                                                  ? "flex"
                                                  : "none",
                                        }}
                                        className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                                      />
                                      <div
                                        onMouseEnter={() =>
                                          setShowErrorMsgByTimeslotID(
                                            item.TimeslotID,
                                          )
                                        }
                                        onMouseLeave={() =>
                                          setShowErrorMsgByTimeslotID("")
                                        }
                                        style={{
                                          display:
                                            item.TimeslotID ==
                                            showErrorMsgByTimeslotID
                                              ? "flex"
                                              : "none",
                                        }}
                                        className="absolute top-[-50px] left-2 p-1 w-[150px] h-fit z-50 rounded border bg-white"
                                      >
                                        <p className="text-[12px]">
                                          ไม่สามารถจัดวิชาที่เลือกลงในเวลาพักเที่ยง
                                        </p>
                                      </div>
                                      <RemoveCircleIcon
                                        onClick={() =>
                                          removeSubjectFromSlot(
                                            item.subject,
                                            item.TimeslotID,
                                          )
                                        }
                                        style={{
                                          color: "#ef4444",
                                          display:
                                            typeof item.subject.GradeID !==
                                            "string"
                                              ? "none"
                                              : Object.keys(
                                                    changeTimeSlotSubject,
                                                  ).length !== 0
                                                ? "none"
                                                : item.subject.Scheduled
                                                  ? "none"
                                                  : "flex",
                                        }}
                                        className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute right-[-11px] top-[-10px]"
                                      />
                                      <HttpsIcon
                                        onMouseEnter={() =>
                                          setShowLockDataMsgByTimeslotID(
                                            item.TimeslotID,
                                          )
                                        }
                                        onMouseLeave={() =>
                                          setShowLockDataMsgByTimeslotID("")
                                        }
                                        style={{
                                          color: "#3d3d3d",
                                          display:
                                            typeof item.subject.GradeID !==
                                            "string"
                                              ? "flex"
                                              : "none",
                                        }}
                                        className="rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                                      />
                                      <div
                                        onMouseEnter={() =>
                                          setShowLockDataMsgByTimeslotID(
                                            item.TimeslotID,
                                          )
                                        }
                                        onMouseLeave={() =>
                                          setShowLockDataMsgByTimeslotID("")
                                        }
                                        style={{
                                          display:
                                            item.TimeslotID ==
                                            showLockDataMsgByTimeslotID
                                              ? "flex"
                                              : "none",
                                        }}
                                        className="absolute top-[-68px] text-left left-2 p-1 w-[150px] h-fit z-50 rounded border bg-white"
                                      >
                                        <p className="text-[12px]">
                                          คาบนี้ถูกล็อก
                                          สามารถจัดการคาบล็อกได้ที่แท็บ{" "}
                                          <b>ล็อกคาบสอน</b>
                                        </p>
                                      </div>
                                    </>
                                  );
                                }}
                              </Draggable>
                            </>
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
    </>
  );
}

export default TimeSlot;
