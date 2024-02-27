import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import type { class_schedule, subject } from "@prisma/client";
import { Fragment } from "react";
import { Draggable } from "react-beautiful-dnd";
interface ITimetableCellProps {}
function TimetableCell({
  item,
  checkRelatedYearDuringDragging,
  addRoomModal,
  clickOrDragToChangeTimeSlot,
  isCilckToChangeSubject,
  dropOutOfZone,
  displayErrorChangeSubject,
  setShowErrorMsgByTimeslotID,
  showErrorMsgByTimeslotID,
  removeSubjectFromSlot,
  setShowLockDataMsgByTimeslotID,
  showLockDataMsgByTimeslotID,
  storeSelectedSubject,
  changeTimeSlotSubject,
}) {
    const checkBreakTime = (breakTimeState: string): boolean => {
        //เช็คคาบพักแบบมอต้นและปลาย
        let result: boolean =
          ((Object.keys(storeSelectedSubject).length !== 0 ||
            Object.keys(changeTimeSlotSubject).length !== 0) && //ถ้ามีการกดเลือกวิชาหรือกดเปลี่ยนวิชา
            breakTimeState == "BREAK_JUNIOR" &&
            [1, 2, 3].includes(yearSelected)) || //สมมติเช็คว่าถ้าคาบนั้นเป็นคาบพักของมอต้น จะนำวิชาที่คลิกเลือกมาเช็คว่า Year มันอยู่ใน [1, 2, 3] หรือไม่
          (breakTimeState == "BREAK_SENIOR" && [4, 5, 6].includes(yearSelected));
        return breakTimeState == "BREAK_BOTH" ? true : result;
      };
  const timeSlotCssClassName = (
    breakTimeState: string,
    subjectInSlot: object,
  ) => {
    //เช็คคาบพักเมื่อไมีมีการกดเลือกวิชา (ตอนยังไม่มี action ไรเกิดขึ้น)
    let condition: boolean =
      Object.keys(storeSelectedSubject).length <= 1 &&
      Object.keys(changeTimeSlotSubject).length == 0 && //ถ้าไม่มีการกดเลือกหรือเปลี่ยนวิชาเลย
      (breakTimeState == "BREAK_BOTH" ||
        breakTimeState == "BREAK_JUNIOR" ||
        breakTimeState == "BREAK_SENIOR") &&
      Object.keys(subjectInSlot).length == 0; //เช็คว่ามีคาบพักมั้ย
    let disabledSlot = `grid w-[100%] flex justify-center h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200`; //slot ปิดตาย (คาบพัก)
    let enabledSlot = `grid w-[100%] items-center justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white
                          ${
                            Object.keys(storeSelectedSubject).length !== 0 &&
                            Object.keys(subjectInSlot).length == 0 //ถ้ามีการเกิด action กำลังลากวิชาหรือมีการกดเลือกวิชา จะแสดงสีเขียวพร้อมกระพริบๆช่องที่พร้อมลง
                              ? "border-emerald-300 cursor-pointer border-dashed"
                              : (
                                    Object.keys(subjectInSlot).length !== 0
                                      ? displayErrorChangeSubject(
                                          breakTimeState,
                                          subjectInSlot.gradelevel.Year,
                                        )
                                      : false
                                  )
                                ? "border-red-300"
                                : Object.keys(changeTimeSlotSubject).length !==
                                    0 //ถ้ากดเปลี่ยนวิชา จะให้กรอบสีฟ้า
                                  ? "border-blue-300 border-dashed"
                                  : Object.keys(subjectInSlot).length !== 0 //ถ้ามีวิชาที่ลงแล้ว จะให้กรอบเป็นสีแดง
                                    ? "border-red-300"
                                    : "border-dashed" //ถ้าไม่มีวิชาอยู่ในช่อง จะให้แสดงเป็นเส้นกรอบขีดๆเอาไว้
                          } 
                          duration-200`;
    return condition
      ? disabledSlot
      : typeof subjectInSlot.GradeID !== "string" &&
          Object.keys(subjectInSlot).length !== 0
        ? disabledSlot //ถ้าเป็นคาบล็อก (ตอนนี้เช็คจาก GradeID ของคาบที่อยู่ใน slot แล้ว)
        : checkBreakTime(breakTimeState) &&
            Object.keys(subjectInSlot).length == 0
          ? disabledSlot
          : enabledSlot; //ถ้าเงื่อนไขคาบพักเป็นจริง จะปิด slot ไว้
    //condition คือเงื่อนไขที่เช็คว่า timeslot มีคาบพัก default และไม่มีการ action เลือกวิชาใช่หรือไม่ ถ้าใช้ก็จะปิด slot
    //checkBreakTime(breakTimeState) คือการส่งสถานะของคาบพักไปเช็คว่าเป็นคาบพักของมอต้นหรือมอปลาย จะใชร่วมกับตอนกดเลือกวิชาเพื่อเพิ่มหรือเลือกวิชาเพื่อสลับวืชา
    //&& Object.keys(subjectInSlot).length == 0 ส่วนอันนี้คือเช็คว่าถ้าไม่มีวิชาใน slot จะปิดคาบไว้
  };
  return (
    <Fragment key={`DROPZONE${item.TimeslotID}`}>
      <StrictModeDroppable //จะลากลงไม่ได้ก็ต่อเมื่อเป็นคาบพักและเป็นวิชาที่มีอยู่ใน slot แล้ว (ไม่รวมสลับวิชาระหว่างช่อง)
        isDropDisabled={
          //ถ้ามีพักเที่ยงก็ปิดช่องเลย
          checkBreakTime(item.Breaktime) || //ถ้าเป็นวิชาล็อก GradeID จะเป็น array
          (typeof item.subject.GradeID !== "string" &&
            Object.keys(item.subject).length !== 0) || //ถ้าลากเพิ่มวิชา ต้องลากลงได้แค่ช่องว่างเท่านั้น
          (Object.keys(storeSelectedSubject).length !== 0 &&
            Object.keys(item.subject).length !== 0) || //ถ้าลากในออกนอก ให้เช็คว่าคาบ NOT_BREAK ที่มีวิชา related กับ yearSelected ไหม
          (item.Breaktime == "NOT_BREAK" &&
          Object.keys(item.subject).length !== 0
            ? checkRelatedYearDuringDragging(item.subject.gradelevel.Year)
            : false)
        }
        droppableId={`${item.TimeslotID}`}
      >
        {(provided, snapshot) => (
          <td
            style={{
              backgroundColor: snapshot.isDraggingOver ? "white" : null,
            }}
            className={timeSlotCssClassName(item.Breaktime, item.subject)}
            {...provided.droppableProps}
            ref={provided.innerRef} // onClick={() => console.log(item)}
          >
            {Object.keys(item.subject).length === 0 ? ( //ถ้าไม่มีวิชาใน timeslot
              //ถ้ายังไม่กดเลือกวิชาจะซ่อนปุ่ม + เอาไว้
              <>
                <AddCircleIcon
                  style={{
                    color: "#10b981",
                    display:
                      Object.keys(storeSelectedSubject).length == 0 ||
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
                      Object.keys(changeTimeSlotSubject).length == 0 ||
                      checkBreakTime(item.Breaktime)
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
              </> //ถ้ามีวิชาอยู่ใน timeslot
            ) : (
              <>
                <Draggable
                  isDragDisabled={
                    (isCilckToChangeSubject &&
                      item.TimeslotID !== timeslotIDtoChange.source) ||
                    typeof item.subject.GradeID !== "string"
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
                          style={{
                            display:
                              Object.keys(item.subject).length == 0
                                ? "none"
                                : "flex",
                          }}
                          className={`text-center select-none flex flex-col ${
                            snapshot.isDragging
                              ? "w-fit h-fit bg-white rounded"
                              : ""
                          }`}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <b className="text-sm">{item.subject.SubjectCode}</b>
                          <b className="text-xs">
                            {item.subject.SubjectName.substring(0, 8)}
                            ...
                          </b>
                          <b className="text-xs">
                            {typeof item.subject.GradeID !== "string"
                              ? null
                              : `ม.${item.subject.GradeID[0]}/${
                                  parseInt(
                                    item.subject.GradeID.substring(1, 2),
                                  ) < 10
                                    ? item.subject.GradeID[2]
                                    : item.subject.GradeID.substring(1, 2)
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
                            ),
                              console.log(item);
                          }}
                          style={{
                            color:
                              item.TimeslotID == timeslotIDtoChange.source
                                ? "#fcba03"
                                : "#2563eb",
                            display:
                              Object.keys(storeSelectedSubject).length !== 0 ||
                              typeof item.subject.GradeID !== "string"
                                ? "none"
                                : displayErrorChangeSubject(
                                      item.Breaktime,
                                      item.subject.gradelevel.Year,
                                    )
                                  ? "none"
                                  : "flex",
                          }}
                          className={`cursor-pointer ${
                            item.TimeslotID == timeslotIDtoChange.source
                              ? "hover:fill-amber-500 animate-pulse"
                              : "hover:fill-blue-700"
                          } bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px] rotate-90`}
                        />
                        <ErrorIcon
                          onMouseEnter={() =>
                            setShowErrorMsgByTimeslotID(item.TimeslotID)
                          }
                          onMouseLeave={() => setShowErrorMsgByTimeslotID("")}
                          style={{
                            color: "#ef4444",
                            display:
                              Object.keys(storeSelectedSubject).length !== 0 ||
                              typeof item.subject.GradeID !== "string"
                                ? "none"
                                : displayErrorChangeSubject(
                                      item.Breaktime,
                                      item.subject.gradelevel.Year,
                                    )
                                  ? "flex"
                                  : "none",
                          }}
                          className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                        />
                        <div
                          onMouseEnter={() =>
                            setShowErrorMsgByTimeslotID(item.TimeslotID)
                          }
                          onMouseLeave={() => setShowErrorMsgByTimeslotID("")}
                          style={{
                            display:
                              item.TimeslotID == showErrorMsgByTimeslotID
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
                            removeSubjectFromSlot(item.subject, item.TimeslotID)
                          }
                          style={{
                            color: "#ef4444",
                            display:
                              typeof item.subject.GradeID !== "string"
                                ? "none"
                                : Object.keys(changeTimeSlotSubject).length !==
                                    0
                                  ? "none"
                                  : "flex",
                          }}
                          className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute right-[-11px] top-[-10px]"
                        />
                        <HttpsIcon
                          onMouseEnter={() =>
                            setShowLockDataMsgByTimeslotID(item.TimeslotID)
                          }
                          onMouseLeave={() =>
                            setShowLockDataMsgByTimeslotID("")
                          }
                          style={{
                            color: "#3d3d3d",
                            display:
                              typeof item.subject.GradeID !== "string"
                                ? "flex"
                                : "none",
                          }}
                          className="rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                        />
                        <div
                          onMouseEnter={() =>
                            setShowLockDataMsgByTimeslotID(item.TimeslotID)
                          }
                          onMouseLeave={() =>
                            setShowLockDataMsgByTimeslotID("")
                          }
                          style={{
                            display:
                              item.TimeslotID == showLockDataMsgByTimeslotID
                                ? "flex"
                                : "none",
                          }}
                          className="absolute top-[-68px] text-left left-2 p-1 w-[150px] h-fit z-50 rounded border bg-white"
                        >
                          <p className="text-[12px]">
                            คาบนี้ถูกล็อก สามารถจัดการคาบล็อกได้ที่แท็บ{" "}
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
  );
}
export default TimetableCell;
