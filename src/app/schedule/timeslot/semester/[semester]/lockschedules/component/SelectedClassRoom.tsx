import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment } from "react";

type Props = {
    allClassRoom:any;
    Grade:any;
    classRoomHandleChange:any;
};

function SelectedClassRoom(props: Props) {
  return (
    <>
      <div className="flex flex-col gap-3 justify-between w-full">
        <div className="text-sm flex gap-2">
          <div className="text-sm flex gap-1">
            <p>เลือกห้องเรียน</p>
            <p className="text-red-500">*</p>
          </div>
          <p className="text-blue-500">(คลิกที่ห้องเรียนเพื่อเลือก)</p>
        </div>
        {[1, 2, 3, 4, 5, 6].map((grade) => (
          <Fragment key={`selectGrade${grade}`}>
            <div className="flex justify-between p-2 w-full h-fit border border-[#EDEEF3] items-center">
              <p>{`ม.${grade}`}</p>
              {/* <CheckBox label={`ม.${grade}`} /> */}
              <div className="flex flex-wrap w-1/2 justify-end gap-3">
                {props.allClassRoom
                  .filter((item) => item.Year == grade)[0]
                  .rooms.map((classroom: any) => (
                    <Fragment key={classroom}>
                      <MiniButton
                        titleColor={
                          props.Grade.filter(
                            (item) => item.Year == grade
                          )[0].ClassRooms.includes(
                            parseInt(
                              `${grade}${
                                classroom < 10 ? `0${classroom}` : classroom
                              }`
                            )
                          )
                            ? "#008022"
                            : "#222222"
                        }
                        borderColor={
                          props.Grade.filter(
                            (item) => item.Year == grade
                          )[0].ClassRooms.includes(
                            parseInt(
                              `${grade}${
                                classroom < 10 ? `0${classroom}` : classroom
                              }`
                            )
                          )
                            ? "#abffc1"
                            : "#888888"
                        }
                        buttonColor={
                          props.Grade.filter(
                            (item) => item.Year == grade
                          )[0].ClassRooms.includes(
                            parseInt(
                              `${grade}${
                                classroom < 10 ? `0${classroom}` : classroom
                              }`
                            )
                          )
                            ? "#abffc1"
                            : "#ffffff"
                        }
                        border={true}
                        title={`ม.${grade}/${classroom}`}
                        handleClick={() => {
                          props.classRoomHandleChange(
                            `${grade}${
                              classroom < 10 ? `0${classroom}` : classroom
                            }`
                          );
                        }}
                        width={""}
                        height={""}
                        isSelected={false}
                        hoverable={false}
                      />
                    </Fragment>
                  ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export default SelectedClassRoom;
