import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import React, { Fragment } from "react";
import { Draggable } from "react-beautiful-dnd";
import SubjectItem from "./SubjectItem";
import { subject, teacher } from "@prisma/client";

type Props = {
    subjectData: [];
    dropOutOfZone: Function;
    clickOrDragToSelectSubject: Function;
    storeSelectedSubject: any;
    teacher: teacher;
};

const SubjectDragBox = ({subjectData, dropOutOfZone, storeSelectedSubject, clickOrDragToSelectSubject, teacher}: Props) => {
  return (
    <>
      {/* กล่องบน */}
      <div className="flex flex-col w-full border border-[rgb(237,238,243)] p-4 gap-4 mt-4">
        <p
          className="text-sm"
        >
          วิชาที่สามารถจัดลงได้ <b>(คลิกหรือลากวิชาที่ต้องการ)</b>
        </p>
        <div className="flex w-full text-center">
          <StrictModeDroppable droppableId="SUBJECTS" direction="horizontal">
            {(provided, snapshot) => (
              <div
                className="grid w-full h-[125px] text-center grid-cols-8 overflow-y-scroll overflow-x-hidden"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {subjectData.map((item, index) => (
                  <SubjectItem item={{
                    SubjectCode: item.SubjectCode,
                    GradeID: item.GradeID,
                    SubjectName: item.SubjectName
                  }} index={index} teacherData={{
                    Firstname: teacher.Firstname
                  }} storeSelectedSubject={storeSelectedSubject} clickOrDragToSelectSubject={clickOrDragToSelectSubject} dropOutOfZone={dropOutOfZone} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </div>
      </div>
    </>
  );
};

export default SubjectDragBox;

{/* <Fragment
                    key={`${item.SubjectCode}-${item.GradeID}-${index}`}
                  >
                    <Draggable
                      draggableId={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                      key={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        if (snapshot.isDropAnimating) {
                          //เช็คว่ามีการปล่อยเมาส์มั้ย
                          dropOutOfZone(item); //ถ้ามีก็เรียกใช้ฟังก์ชั่นพร้อมส่งวิชาที่เลือกลงไป
                        }
                        return (
                          <>
                            <div
                              className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-grab ${
                                storeSelectedSubject == item //ถ้าคลิกหรือลากวิชา จะแสดงเขียวๆกะพริบๆ
                                  ? "bg-green-200 hover:bg-green-300 border-green-500 animate-pulse"
                                  : "bg-white hover:bg-slate-50"
                              } duration-100 select-none`}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              ref={provided.innerRef}
                              onClick={() => clickOrDragToSelectSubject(item)}
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
                              <p className="text-xs">{teacherData.Firstname}</p>
                            </div>
                          </>
                        );
                      }}
                    </Draggable>
                  </Fragment> */}
