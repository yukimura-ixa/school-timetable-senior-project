import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  CloseModal: any;
};

function SelectSubjectToTimeslotModal(props: Props) {
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
            <div className="flex justify-between items-center w-full">
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
            </div>
            <div className="flex flex-col gap-3 p-4 w-full h-[150px] border border-[#EDEEF3] overflow-y-auto">
              <p className="text-sm">เลือกวิชาที่มีการสอนสำหรับ ม.3/2</p>
              <div className="flex flex-wrap w-full gap-3 text-center">
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded bg-green-100 text-green-600 cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
                <div className="flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none">
                  <p>ท31201</p>
                  <p>ภาษาไทย</p>
                </div>
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
            <button className="w-[100px] h-[45px] rounded bg-blue-500 text-white">บันทึก</button>
            <button className="w-[100px] h-[45px] rounded bg-red-500 text-white">ยกเลิก</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectSubjectToTimeslotModal;
