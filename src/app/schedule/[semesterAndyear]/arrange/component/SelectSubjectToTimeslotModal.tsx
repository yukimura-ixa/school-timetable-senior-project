import { useRoomData } from "@/app/_hooks/roomData";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  CloseModal: any;
  AddSubjectToSlot: any; //ฟังก์ชั่นเพิ่มวิชา
  timeSlotID: any; //ไอดีของช่องตาราง
  subjects: any; //ข้อมูลวิชาทั้งหมด
  fromDnd: boolean; //ถ้าเพิ่มวิชาจากการ Drag and drop
  subjectSelected: object; //ในเคสที่ลากวิชาลงมาจะใส่วิชามาด้วย
  setIsDragState: any; //ถ้ามีการกดเพิ่มหรือยกเลิกให้แก้ state กลับเป็น false
  returnSubject: any; //ถ้ามีการยกเลิกการทำรายการจาการ Drag จะทำการคืนวิชาเข้าช่องรวมวิชา
  removeSubjectSelected: any; //ลบวิชาเมื่อมีการเลือกวิชาและกดยืนยัน
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const [subjects, setSubjects] = useState(props.subjects);
  const [selected, setSelected] = useState(null);
  const [subjectSelected, setSubjectSelected] = useState(props.subjectSelected);
  const [RoomID, setRoomID] = useState("");
  const roomData = useRoomData();
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[580px] h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p
              className="text-lg select-none"
              onClick={() => console.log(subjectSelected)}
            >
              จัดวิชาเรียนลงในคาบ (2/8/24) ยังไม่ validate
            </p>
            <AiOutlineClose
              className="cursor-pointer"
              onClick={() => {
                props.CloseModal(),
                  props.setIsDragState(),
                  Object.keys(subjectSelected).length == 0
                    ? null
                    : props.returnSubject(subjectSelected);
              }}
            />
          </div>
          <div className="flex flex-col gap-3 p-4 w-full h-fit border border-[#EDEEF3]">
            {/* เดี๋ยวใช้ต่อ */}
            {/* <div className="flex justify-between items-center w-full">
              <p>เลือกชั้นเรียน</p>
              <Dropdown
                width={250}
                data={["Hi"]}
                placeHolder="ม.3/2"
                renderItem={({ data }) => (
                  <>
                    <p>{data}</p>
                  </>
                )}
                currentValue={undefined}
                handleChange={undefined}
                searchFunciton={undefined}
              />
            </div> */}
            {props.fromDnd ? null : (
              <div className="flex flex-col gap-3 p-4 w-full h-[150px] border border-[#EDEEF3] overflow-y-auto">
                {/* <p className="text-sm">เลือกวิชาที่มีการสอนสำหรับ ม.3/2</p> */}
                <div className="flex flex-wrap w-full gap-3 text-center">
                  {subjects.map((item, index) => (
                    <React.Fragment key={`${index}${item.SubjectCode}`}>
                      {selected == index ? (
                        <div
                          onClick={() => {
                            setSelected(index), setSubjectSelected(item);
                          }}
                          className="flex flex-col py-2 text-sm w-[70px] h-fit rounded bg-green-100 text-green-600 cursor-pointer select-none"
                        >
                          <p>{item.SubjectCode}</p>
                          <p>{item.SubjectName.substring(0, 9)}</p>
                          <p>{item.GradeID}</p>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setSelected(index), setSubjectSelected(item);
                          }}
                          className="flex flex-col py-2 text-sm w-[70px] h-fit rounded border border-[#EDEEF3] cursor-pointer select-none"
                        >
                          <p>{item.SubjectCode}</p>
                          <p>{item.SubjectName.substring(0, 9)}</p>
                          <p>{item.GradeID}</p>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center w-full">
              <p>เลือกสถานที่เรียน</p>
              <Dropdown
                width={250}
                data={roomData.data.map((grade) => grade.RoomName)}
                placeHolder="โปรดเลือก"
                renderItem={({ data }) => (
                  <>
                    <p>{data}</p>
                  </>
                )}
                currentValue={RoomID}
                handleChange={(data) => setRoomID(() => data)}
                searchFunciton={undefined}
              />
            </div>
          </div>
          <div className="flex w-full items-end justify-end gap-4">
            <button
              onClick={() => {
                props.CloseModal(),
                  props.setIsDragState(),
                  Object.keys(subjectSelected).length == 0
                    ? null
                    : props.returnSubject(subjectSelected);
              }}
              className="w-[100px] h-[45px] rounded bg-red-100 text-red-500"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => {
                props.AddSubjectToSlot(
                  { ...subjectSelected, RoomID: RoomID },
                  props.timeSlotID
                ),
                  props.setIsDragState(),
                  props.removeSubjectSelected(
                    subjects.filter((item, index) => index != selected)
                  );
              }}
              className="w-[100px] h-[45px] rounded bg-blue-100 text-blue-500"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectSubjectToTimeslotModal;
