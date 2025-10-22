/**
 * TimeslotCell Component - Refactored with @dnd-kit
 * 
 * Week 6.2 - Droppable cell for schedule timeslots
 * Replaces StrictModeDroppable with @dnd-kit useDroppable
 */

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HttpsIcon from "@mui/icons-material/Https";

interface TimeslotCellProps {
  item: any;
  index: number;
  timeSlotDataLength: number;
  checkBreakTime: Function;
  isSelectedToAdd: Function;
  isSelectedToChange: Function;
  timeSlotCssClassName: Function;
  storeSelectedSubject: any;
  addRoomModal: Function;
  changeTimeSlotSubject: any;
  clickOrDragToChangeTimeSlot: Function;
  isCilckToChangeSubject: boolean;
  timeslotIDtoChange: {
    source: string;
    destination: string;
  };
  removeSubjectFromSlot: Function;
  showErrorMsgByTimeslotID: string;
  showLockDataMsgByTimeslotID: string;
  setShowErrorMsgByTimeslotID: Function;
  setShowLockDataMsgByTimeslotID: Function;
  displayErrorChangeSubject: Function;
}

export function TimeslotCell({
  item,
  index,
  timeSlotDataLength,
  checkBreakTime,
  isSelectedToAdd,
  isSelectedToChange,
  timeSlotCssClassName,
  storeSelectedSubject,
  addRoomModal,
  changeTimeSlotSubject,
  clickOrDragToChangeTimeSlot,
  isCilckToChangeSubject,
  timeslotIDtoChange,
  removeSubjectFromSlot,
  showErrorMsgByTimeslotID,
  showLockDataMsgByTimeslotID,
  setShowErrorMsgByTimeslotID,
  setShowLockDataMsgByTimeslotID,
  displayErrorChangeSubject,
}: TimeslotCellProps) {
  // Droppable hook for adding subjects
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.TimeslotID,
    data: {
      type: "timeslot",
      timeslotID: item.TimeslotID,
      item,
    },
    disabled:
      checkBreakTime(item.Breaktime) ||
      item.subject?.Scheduled ||
      (typeof item.subject?.GradeID !== "string" &&
        Object.keys(item.subject || {}).length !== 0) ||
      (isSelectedToAdd() && Object.keys(item.subject || {}).length !== 0),
  });

  // Sortable hook for dragging existing subjects
  const hasSubject = Object.keys(item.subject || {}).length > 0;
  const {
    attributes,
    listeners,
    setNodeRef: setSortRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `Slot-${item.TimeslotID}-Index-${index}`,
    data: {
      type: "timeslot",
      timeslotID: item.TimeslotID,
      subject: item.subject,
    },
    disabled:
      !hasSubject ||
      (isCilckToChangeSubject &&
        item.TimeslotID !== timeslotIDtoChange.source) ||
      typeof item.subject?.GradeID !== "string" ||
      item.subject?.Scheduled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isOver ? "white" : undefined,
    width: `${1062 / timeSlotDataLength - 10}px`,
  };

  const isLocked = typeof item.subject?.GradeID !== "string";

  return (
    <td
      ref={hasSubject ? setSortRef : setDropRef}
      style={style}
      className={timeSlotCssClassName(item.Breaktime, item.subject)}
    >
      {!hasSubject ? (
        // Empty timeslot - show add buttons
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
              {item.Breaktime === "BREAK_JUNIOR"
                ? "มัธยมต้น"
                : item.Breaktime === "BREAK_SENIOR"
                  ? "มัธยมปลาย"
                  : "กลางวัน"}
            </p>
          </div>
          <AddCircleIcon
            style={{
              color: "#10b981",
              display:
                Object.keys(storeSelectedSubject).length === 0 ||
                checkBreakTime(item.Breaktime) ||
                isOver
                  ? "none"
                  : "flex",
            }}
            className="cursor-pointer hover:fill-emerald-600 duration-300 animate-pulse"
            onClick={() => addRoomModal(item.TimeslotID)}
          />
          <ChangeCircleIcon
            style={{
              color: "#345eeb",
              display:
                Object.keys(changeTimeSlotSubject).length === 0 ||
                checkBreakTime(item.Breaktime)
                  ? "none"
                  : "flex",
            }}
            className="cursor-pointer hover:fill-blue-600 duration-300 animate-pulse rotate-90"
            onClick={() =>
              clickOrDragToChangeTimeSlot(item.subject, item.TimeslotID, true)
            }
          />
        </>
      ) : (
        // Has subject - show subject details
        <div
          className={`text-center select-none flex flex-col ${
            isDragging ? "w-fit h-fit bg-white rounded opacity-50" : ""
          }`}
          {...(hasSubject && !isLocked ? { ...attributes, ...listeners } : {})}
        >
          <b className="text-sm">{item.subject.SubjectCode}</b>
          <b className="text-xs">
            {item.subject.SubjectName?.substring(0, 8)}...
          </b>
          <b
            style={{
              display: item.subject.IsLocked ? "none" : "flex",
              justifyContent: "center",
            }}
            className="text-xs"
          >
            {typeof item.subject.GradeID !== "string"
              ? null
              : `ม.${item.subject.GradeID[0]}/${parseInt(
                  item.subject.GradeID.substring(1),
                )}`}
          </b>
          <p className="text-xs">
            {(item.subject.RoomName ?? "").length > 9
              ? `${item.subject.RoomName.substring(0, 9)}...`
              : item.subject.RoomName}
          </p>

          {/* Error/Lock Icons */}
          {item.subject.IsLocked && (
            <HttpsIcon
              className="text-yellow-600 cursor-pointer"
              onClick={() => {
                setShowLockDataMsgByTimeslotID(
                  item.TimeslotID,
                  showLockDataMsgByTimeslotID !== item.TimeslotID,
                );
                setShowErrorMsgByTimeslotID(item.TimeslotID, false);
              }}
            />
          )}

          {!item.subject.IsLocked && !item.subject.Scheduled && (
            <>
              <RemoveCircleIcon
                className="text-red-600 cursor-pointer hover:fill-red-700 duration-300"
                onClick={() => removeSubjectFromSlot(item.subject, item.TimeslotID)}
              />
              <ChangeCircleIcon
                style={{
                  color:
                    changeTimeSlotSubject?.SubjectCode ===
                    item.subject.SubjectCode
                      ? "#2563eb"
                      : "#9ca3af",
                  display:
                    Object.keys(storeSelectedSubject).length !== 0
                      ? "none"
                      : "flex",
                }}
                className="cursor-pointer hover:fill-blue-600 duration-300 rotate-90"
                onClick={() =>
                  clickOrDragToChangeTimeSlot(
                    item.subject,
                    item.TimeslotID,
                    true,
                  )
                }
              />
            </>
          )}

          {/* Error message display */}
          {showErrorMsgByTimeslotID === item.TimeslotID && (
            <div className="absolute z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <ErrorIcon className="text-red-600" />
              <p className="text-sm">{displayErrorChangeSubject()}</p>
            </div>
          )}

          {/* Lock message display */}
          {showLockDataMsgByTimeslotID === item.TimeslotID && isLocked && (
            <div className="absolute z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <HttpsIcon className="text-yellow-600" />
              <p className="text-sm">
                ล็อกสำหรับ:{" "}
                {Array.isArray(item.subject.GradeID)
                  ? item.subject.GradeID.join(", ")
                  : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </td>
  );
}
