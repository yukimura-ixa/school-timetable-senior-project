import { Fragment } from "react";
import { Draggable } from "react-beautiful-dnd";

interface ISubjectItemProps {
    item: object;
    index: number;
    teacherData: {
        Firstname: string;
    }; 
    storeSelectedSubject: any;
    clickOrDragToSelectSubject: any;
    dropOutOfZone: any;
    }
function SubjectItem({ item, index, teacherData, storeSelectedSubject, clickOrDragToSelectSubject, dropOutOfZone }: ISubjectItemProps) {
  return (
    <Fragment key={`${item.SubjectCode}-${item.GradeID}-${index}`}>
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
                className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-pointer ${
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
                <p className="text-sm">{item.SubjectName.substring(0, 8)}...</p>
                <b className="text-xs">
                  ม.{item.GradeID[0]}/
                  {parseInt(item.GradeID.substring(1, 2)) < 10
                    ? item.GradeID[2]
                    : item.GradeID.substring(1, 2)}
                </b>
                <div className="flex gap-1 justify-center">
                  <p className="text-xs">{teacherData.Firstname}</p>
                  {/* <p style={{display : Object.keys(item.room).length == 0 ? 'none' : 'flex' ,fontSize : 10}}>({item.RoomName})</p> */}
                </div>
              </div>
            </>
          );
        }}
      </Draggable>
    </Fragment>
  );
}

export default SubjectItem;