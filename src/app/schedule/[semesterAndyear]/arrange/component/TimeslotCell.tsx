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

/**
 * Props for TimeslotCell component
 * Phase 1: Migrated from 'any' and 'Function' types to strict types
 */
interface TimeslotCellProps {
  // Core data
  item: import('@/types/schedule.types').TimeslotData;
  index: number;
  timeSlotDataLength: number;
  
  // Callback functions with proper signatures
  checkBreakTime: import('@/types/schedule.types').CheckBreakTimeCallback;
  isSelectedToAdd: import('@/types/schedule.types').IsSelectedToAddCallback;
  isSelectedToChange: import('@/types/schedule.types').IsSelectedToChangeCallback;
  timeSlotCssClassName: import('@/types/schedule.types').TimeSlotCssClassNameCallback;
  
  // Subject and operation data
  storeSelectedSubject: import('@/types/schedule.types').SubjectData | null;
  changeTimeSlotSubject: import('@/types/schedule.types').SubjectData | null;
  
  // Action callbacks
  addRoomModal: import('@/types/schedule.types').AddRoomModalCallback;
  clickOrDragToChangeTimeSlot: import('@/types/schedule.types').ClickOrDragToChangeCallback;
  removeSubjectFromSlot: import('@/types/schedule.types').RemoveSubjectCallback;
  displayErrorChangeSubject: import('@/types/schedule.types').DisplayErrorChangeSubjectCallback;
  
  // State flags
  isClickToChangeSubject: boolean; // Fixed typo from isCilckToChangeSubject
  timeslotIDtoChange: import('@/types/schedule.types').TimeslotChange;
  
  // Error display state
  showErrorMsgByTimeslotID: string;
  showLockDataMsgByTimeslotID: string;
  setShowErrorMsgByTimeslotID: import('@/types/schedule.types').SetErrorStateCallback;
  setShowLockDataMsgByTimeslotID: import('@/types/schedule.types').SetErrorStateCallback;
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
  isClickToChangeSubject, // Fixed typo: was isCilckToChangeSubject
  timeslotIDtoChange,
  removeSubjectFromSlot,
  showErrorMsgByTimeslotID,
  showLockDataMsgByTimeslotID,
  setShowErrorMsgByTimeslotID,
  setShowLockDataMsgByTimeslotID,
  displayErrorChangeSubject: _displayErrorChangeSubject, // unused but kept for API compatibility
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
      item.subject?.scheduled ||
      (typeof item.subject?.gradeID !== "string" && item.subject != null) ||
      (isSelectedToAdd() && item.subject != null),
  });

  // Sortable hook for dragging existing subjects
  const hasSubject = item.subject != null;
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
      (isClickToChangeSubject &&
        item.TimeslotID !== timeslotIDtoChange.source) ||
      typeof item.subject?.gradeID !== "string" ||
      item.subject?.scheduled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isOver ? "white" : undefined,
    width: `${1062 / timeSlotDataLength - 10}px`,
  };

  const isLocked = typeof item.subject?.gradeID !== "string";

  return (
    <td
      ref={hasSubject ? setSortRef : setDropRef}
      style={style}
      className={timeSlotCssClassName(item.subject ?? null, checkBreakTime(item.Breaktime), isLocked)}
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
                !storeSelectedSubject ||
                checkBreakTime(item.Breaktime) ||
                isOver
                  ? "none"
                  : "flex",
            }}
            className="cursor-pointer hover:fill-emerald-600 duration-300 animate-pulse"
            onClick={() => storeSelectedSubject && addRoomModal({ timeslotID: item.TimeslotID, selectedSubject: storeSelectedSubject })}
          />
          <ChangeCircleIcon
            style={{
              color: "#345eeb",
              display:
                !changeTimeSlotSubject ||
                checkBreakTime(item.Breaktime)
                  ? "none"
                  : "flex",
            }}
            className="cursor-pointer hover:fill-blue-600 duration-300 animate-pulse rotate-90"
            onClick={() =>
              clickOrDragToChangeTimeSlot(item.TimeslotID, item.TimeslotID)
            }
          />
        </>
      ) : (
        // Has subject - show subject details
        item.subject && (
        <div
          className={`text-center select-none flex flex-col ${
            isDragging ? "w-fit h-fit bg-white rounded opacity-50" : ""
          }`}
          {...(hasSubject && !isLocked ? { ...attributes, ...listeners } : {})}
        >
          <b className="text-sm">{item.subject.subjectCode}</b>
          <b className="text-xs">
            {item.subject.subjectName?.substring(0, 8)}...
          </b>
          <b
            style={{
              display: isLocked ? "none" : "flex",
              justifyContent: "center",
            }}
            className="text-xs"
          >
            {typeof item.subject.gradeID !== "string"
              ? null
              : `ม.${item.subject.gradeID[0]}/${parseInt(
                  item.subject.gradeID.substring(1),
                )}`}
          </b>
          <p className="text-xs">
            {(item.subject.roomName ?? "").length > 9
              ? `${(item.subject.roomName ?? "").substring(0, 9)}...`
              : item.subject.roomName}
          </p>

          {/* Error/Lock Icons */}
          {isLocked && (
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

          {!isLocked && !item.subject.scheduled && (
            <>
              <RemoveCircleIcon
                className="text-red-600 cursor-pointer hover:fill-red-700 duration-300"
                onClick={() => removeSubjectFromSlot(item.TimeslotID)}
              />
              <ChangeCircleIcon
                style={{
                  color:
                    changeTimeSlotSubject?.subjectCode ===
                    item.subject.subjectCode
                      ? "#2563eb"
                      : "#9ca3af",
                  display: storeSelectedSubject ? "none" : "flex",
                }}
                className="cursor-pointer hover:fill-blue-600 duration-300 rotate-90"
                onClick={() =>
                  clickOrDragToChangeTimeSlot(
                    item.TimeslotID,
                    item.TimeslotID,
                  )
                }
              />
            </>
          )}

          {/* Error message display */}
          {showErrorMsgByTimeslotID === item.TimeslotID && (
            <div className="absolute z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <ErrorIcon className="text-red-600" />
              <p className="text-sm">Error displaying subject</p>
            </div>
          )}

          {/* Lock message display */}
          {showLockDataMsgByTimeslotID === item.TimeslotID && isLocked && (
            <div className="absolute z-10 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <HttpsIcon className="text-yellow-600" />
              <p className="text-sm">
                ล็อกสำหรับ:{" "}
                {Array.isArray(item.subject.gradeID)
                  ? item.subject.gradeID.join(", ")
                  : item.subject.gradeID || ""}
              </p>
            </div>
          )}
        </div>
        )
      )}
    </td>
  );
}
