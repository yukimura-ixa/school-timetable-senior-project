/**
 * TimeSlot Component - Refactored with @dnd-kit
 *
 * Week 6.2 - Removed react-beautiful-dnd dependencies
 * Now uses TimeslotCell component with @dnd-kit
 */

"use client";
import React, { Fragment } from "react";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import TimetableHeader from "./TimetableHeader";
import TimetableRow from "./TimetableRow";
import { TimeslotCell } from "./TimeslotCell";
import type {
  CheckBreakTimeCallback,
  IsSelectedToAddCallback,
  IsSelectedToChangeCallback,
  TimeSlotCssClassNameCallback,
  SubjectData,
  AddRoomModalCallback,
  ClickOrDragToChangeCallback,
  RemoveSubjectCallback,
  SetErrorStateCallback,
  DisplayErrorChangeSubjectCallback,
  TimeslotChange,
  TimeslotWithRelations,
} from "@/types/schedule.types";

type Props = {
  timeSlotData: {
    DayOfWeek: {
      Day: string;
      Dayth: string;
      BgColor: string;
      TextColor: string;
    }[];
    AllData: TimeslotWithRelations[];
    SlotAmount: number[];
  };
  mapTime?: (time: string) => string;
  checkBreakTime: CheckBreakTimeCallback;
  isSelectedToAdd: IsSelectedToAddCallback;
  isSelectedToChange: IsSelectedToChangeCallback;
  checkRelatedYearDuringDragging: (year: number) => boolean;
  timeSlotCssClassName: TimeSlotCssClassNameCallback;
  storeSelectedSubject: SubjectData | null;
  addRoomModal: AddRoomModalCallback;
  changeTimeSlotSubject: SubjectData | null;
  clickOrDragToChangeTimeSlot: ClickOrDragToChangeCallback;
  isClickToChangeSubject: boolean;
  timeslotIDtoChange: TimeslotChange;
  dropOutOfZone: (item: SubjectData) => void;
  displayErrorChangeSubject: DisplayErrorChangeSubjectCallback;
  showErrorMsgByTimeslotID: string;
  removeSubjectFromSlot: RemoveSubjectCallback;
  showLockDataMsgByTimeslotID: string;
  setShowErrorMsgByTimeslotID: SetErrorStateCallback;
  setShowLockDataMsgByTimeslotID: SetErrorStateCallback;
};

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
  isClickToChangeSubject, // Fixed typo: was isCilckToChangeSubject
  timeslotIDtoChange,
  dropOutOfZone,
  displayErrorChangeSubject,
  showErrorMsgByTimeslotID,
  removeSubjectFromSlot,
  showLockDataMsgByTimeslotID,
  setShowLockDataMsgByTimeslotID,
  setShowErrorMsgByTimeslotID,
}: Props) {
  return (
    <>
      <table className="table-auto w-full flex flex-col gap-3 mt-4 mb-10">
        <thead className="flex flex-col gap-3">
          <TimetableHeader timeslot={timeSlotData} />
        </thead>
        <tbody className="flex flex-col gap-3">
          {timeSlotData.DayOfWeek.map((day) => (
            <Fragment key={`Day-${day.Day}`}>
              <tr className="flex gap-4">
                <TimetableRow day={day} />
                {timeSlotData.AllData.filter(
                  (item) => dayOfWeekThai[item.DayOfWeek] == day.Day,
                ).map((item, index) => (
                  <TimeslotCell
                    key={`DROPZONE${item.TimeslotID}`}
                    item={item}
                    index={index}
                    timeSlotDataLength={timeSlotData.SlotAmount.length}
                    checkBreakTime={checkBreakTime}
                    isSelectedToAdd={isSelectedToAdd}
                    isSelectedToChange={isSelectedToChange}
                    timeSlotCssClassName={timeSlotCssClassName}
                    storeSelectedSubject={storeSelectedSubject}
                    addRoomModal={addRoomModal}
                    changeTimeSlotSubject={changeTimeSlotSubject}
                    clickOrDragToChangeTimeSlot={clickOrDragToChangeTimeSlot}
                    isClickToChangeSubject={isClickToChangeSubject}
                    timeslotIDtoChange={timeslotIDtoChange}
                    removeSubjectFromSlot={removeSubjectFromSlot}
                    showErrorMsgByTimeslotID={showErrorMsgByTimeslotID}
                    showLockDataMsgByTimeslotID={showLockDataMsgByTimeslotID}
                    setShowErrorMsgByTimeslotID={setShowErrorMsgByTimeslotID}
                    setShowLockDataMsgByTimeslotID={
                      setShowLockDataMsgByTimeslotID
                    }
                    displayErrorChangeSubject={displayErrorChangeSubject}
                  />
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
