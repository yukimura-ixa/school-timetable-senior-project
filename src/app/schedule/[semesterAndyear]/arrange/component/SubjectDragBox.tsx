/**
 * SubjectDragBox Component - Refactored with @dnd-kit
 * 
 * Week 6.1 - Component Migration
 * Container for draggable subject items using @dnd-kit
 */

import React from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SubjectItem from "./SubjectItem";
import type { teacher } from "@/prisma/generated";

type Props = {
  respData: any[];
  dropOutOfZone?: Function;
  clickOrDragToSelectSubject: Function;
  storeSelectedSubject: any;
  teacher: teacher;
};

const SubjectDragBox = ({
  respData,
  dropOutOfZone,
  storeSelectedSubject,
  clickOrDragToSelectSubject,
  teacher,
}: Props) => {
  // Generate IDs for SortableContext
  const itemIds = respData.map(
    (item, index) => `${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`
  );

  return (
    <>
      <div className="flex flex-col w-full border border-[rgb(237,238,243)] p-4 gap-4 mt-4">
        <p className="text-sm">
          วิชาที่สามารถจัดลงได้ <b>(คลิกหรือลากวิชาที่ต้องการ)</b>
        </p>
        <div className="flex w-full text-center">
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <div className="grid w-full h-[125px] text-center grid-cols-8 overflow-y-scroll overflow-x-hidden">
              {respData.map((item, index) => (
                <SubjectItem
                  key={`${item.SubjectCode}-${index}`}
                  item={item}
                  index={index}
                  teacherData={{
                    Firstname: teacher.Firstname,
                  }}
                  storeSelectedSubject={storeSelectedSubject}
                  clickOrDragToSelectSubject={clickOrDragToSelectSubject}
                  dropOutOfZone={dropOutOfZone}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </>
  );
};

export default SubjectDragBox;

{
  /* <Fragment
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
                  </Fragment> */
}
