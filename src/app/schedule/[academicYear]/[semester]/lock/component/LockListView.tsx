"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbTrash } from "react-icons/tb";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { formatGradeIdDisplay } from "@/utils/grade-display";
import { extractPeriodFromTimeslotId } from "@/utils/timeslot-id";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";

type LockListViewProps = {
  lockData: GroupedLockedSchedule[];
  onAddLock: () => void;
  onDeleteLock: (item: GroupedLockedSchedule) => void;
};

function LockListView({ lockData, onAddLock, onDeleteLock }: LockListViewProps) {
  const [showMoreteachherData, setShowMoreteacherData] = useState<
    number | null
  >(null); //index

  return (
    <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
      {lockData.map((item, lockIndex) => (
        <Fragment key={`${item.SubjectCode}-${lockIndex}`}>
          <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-fit bg-white hover:bg-slate-50 duration-300 drop-shadow rounded">
            <div className="flex justify-between items-center gap-3">
              <p className="text-lg font-medium">
                {item.SubjectCode} - {item.SubjectName}
              </p>
              <div className="flex gap-3">
                <div
                  onClick={() => {
                    onDeleteLock(item);
                  }}
                  className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1 flex-end"
                >
                  <TbTrash size={24} className="text-red-500" />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              สถานที่ : {item.room?.RoomName || "ไม่ระบุ"}
            </p>
            <p className="text-sm text-gray-500">
              คาบที่ :{" "}
              {Array.from(
                new Set(
                  item.timeslots.map((ts) =>
                    extractPeriodFromTimeslotId(ts.TimeslotID),
                  ),
                ),
              )
                .sort((a, b) => a - b)
                .join(",")}
            </p>
            <p className="text-sm text-gray-500">
              วัน :{" "}
              {item.timeslots[0]?.DayOfWeek
                ? dayOfWeekThai[item.timeslots[0].DayOfWeek]
                : "ไม่ระบุ"}
            </p>
            {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">ชั้นเรียน</p>
              <div className="flex flex-wrap w-[365px] h-fit gap-2">
                {item.GradeIDs.map((grade, index) => (
                  <Fragment key={`gradeid${index}`}>
                    <MiniButton
                      width={54}
                      height={25}
                      border={true}
                      borderColor="#c7c7c7"
                      titleColor="#4F515E"
                      buttonColor="#ffffff"
                      title={formatGradeIdDisplay(grade)}
                      handleClick={() => {}}
                      isSelected={false}
                      hoverable={false}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
            {/* ครูที่เลือก */}
            <div className="flex flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">ครูผู้สอน</p>
              <div className="flex flex-wrap w-[365px] h-fit gap-2">
                {item.teachers.map((teacher, index) => (
                  <Fragment key={`${teacher.TeacherID}${index}`}>
                    {index < 3 ? (
                      <MiniButton
                        width="fit-content"
                        height={25}
                        border={true}
                        borderColor="#c7c7c7"
                        titleColor="#4F515E"
                        buttonColor="#ffffff"
                        title={`${teacher.Firstname} - ${
                          teacher.Department &&
                          teacher.Department.length > 10
                            ? `${teacher.Department.substring(0, 10)}...`
                            : teacher.Department || "ไม่ระบุ"
                        }`}
                        handleClick={() => {}}
                        isSelected={false}
                        hoverable={false}
                      />
                    ) : index < 4 ? (
                      <>
                        <div
                          onMouseEnter={() => {
                            setShowMoreteacherData(lockIndex);
                          }}
                          onMouseLeave={() => setShowMoreteacherData(null)}
                          className="relative hover:bg-gray-100 duration-300 w-[100px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                        >
                          <p>...</p>
                          <div
                            style={{
                              display:
                                lockIndex === showMoreteachherData
                                  ? "block"
                                  : "none",
                            }}
                            className="absolute bottom-[23px] right-[0px] text-left border w-[200px] h-fit p-3 bg-white rounded drop-shadow-sm"
                            onMouseEnter={() => {
                              setShowMoreteacherData(lockIndex);
                            }}
                            onMouseLeave={() => setShowMoreteacherData(null)}
                          >
                            {item.teachers.map((item, index) => (
                              <Fragment key={`moredata${index}`}>
                                <div className="flex gap-2">
                                  <p className="font-bold text-sm">
                                    {item.Firstname}
                                  </p>
                                  <p className="text-sm">
                                    {item.Department &&
                                    item.Department.length > 10
                                      ? `${item.Department.substring(0, 10)}...`
                                      : item.Department || "ไม่ระบุ"}
                                  </p>
                                </div>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </Fragment>
      ))}
      <div
        onClick={onAddLock}
        className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[255px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300"
      >
        <MdAddCircle size={24} className="fill-gray-500" />
        <p className="text-lg font-bold">เพิ่มคาบล็อก</p>
      </div>
    </div>
  );
}

export default LockListView;
