import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  CloseModal: any;
  AddSubjectToSlot:any;
  SlotNumber:any;
  DayOfWeek:any;
};

function SelectSubjectToTimeslotModal(props: Props): JSX.Element {
  const [subjects, setSubjects] = useState([
    {
      SubjectCode: "ท31201",
      SubjectName: "ภาษาไทยเพิ่มเติม",
    },
    {
      SubjectCode: "ท21101",
      SubjectName: "ภาษาไทยพื้นฐาน",
    },
    {
      SubjectCode: "ท31201",
      SubjectName: "ภาษาไทยเพิ่มเติม",
    },
    {
      SubjectCode: "ท21101",
      SubjectName: "ภาษาไทยพื้นฐาน",
    },
  ]);
  const [selected, setSelected] = useState(null);
  const [subjectSelected, setSubjectSelected] = useState(null);
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[580px] h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">จัดวิชาเรียนลงในคาบ</p>
            <AiOutlineClose
              className="cursor-pointer"
              onClick={() => props.CloseModal()}
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
            <div className="flex flex-col gap-3 p-4 w-full h-[150px] border border-[#EDEEF3] overflow-y-auto">
              <p className="text-sm">เลือกวิชาที่มีการสอนสำหรับ ม.3/2</p>
              <div className="flex flex-wrap w-full gap-3 text-center">
                {subjects.map((item, index) => (
                  <React.Fragment key={`${index}${item.SubjectCode}`}>
                    {selected == index 
                    ?
                    <div onClick={() => {setSelected(index), setSubjectSelected(item)}} className="flex flex-col py-2 text-sm w-[70px] h-fit rounded bg-green-100 text-green-600 cursor-pointer select-none">
                      <p>{item.SubjectCode}</p>
                      <p>{item.SubjectName}</p>
                    </div>
                    :
                    <div onClick={() => {setSelected(index), setSubjectSelected(item)}} className="flex flex-col py-2 text-sm w-[70px] h-fit rounded border border-[#EDEEF3] cursor-pointer select-none">
                      <p>{item.SubjectCode}</p>
                      <p>{item.SubjectName}</p>
                    </div>
                    }
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <p>เลือกสถานที่เรียน</p>
              <Dropdown
                width={250}
                data={["Hi"]}
                placeHolder="125"
                renderItem={({ data }) => (
                  <>
                    <p>{data}</p>
                  </>
                )}
                currentValue={undefined}
                handleChange={undefined}
                searchFunciton={undefined}
              />
            </div>
          </div>
          <div className="flex w-full items-end justify-end gap-4">
            <button onClick={() => props.AddSubjectToSlot(props.SlotNumber, props.DayOfWeek, subjectSelected, 125)} className="w-[100px] h-[45px] rounded bg-blue-100 text-blue-500">
              บันทึก
            </button>
            <button onClick={props.CloseModal} className="w-[100px] h-[45px] rounded bg-red-100 text-red-500">
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectSubjectToTimeslotModal;
