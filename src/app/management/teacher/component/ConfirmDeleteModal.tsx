import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Teacher } from "../model/teacher";
import api from "@/libs/axios";

type props = {
  closeModal: any;
  teacherData: Teacher[];
  checkedList: any;
  clearCheckList: any;
  dataAmount: number;
};

function ConfirmDeleteModal({
  closeModal,
  teacherData,
  checkedList,
  dataAmount,
  clearCheckList,
}: props) {
  const confirmed = () => {
    removeMultiData(teacherData, checkedList);
    closeModal();
  };
  const cancel = () => {
    if (dataAmount === 1) {
      clearCheckList();
    }
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  //24-11-2023 ปัจจุบัน func ลบ ยังไม่สมบูรณ์ เพราะการลบมันพ่วงโดนหลายตาราง ค่อยมาทำ
  const removeMultiData = async (data: Teacher[], checkedList) => {
    const deleteData = data
      .filter((item, index) => checkedList.includes(index))
      .map((item) => item.TeacherID);

    try {
      const response = await api.delete("/teacher", {
        data: deleteData,
      });
      console.log(response);
      clearCheckList();
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-fit h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">ลบข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={cancel} />
          </div>
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none font-bold">
              คุณต้องการลบข้อมูลที่เลือกทั้งหมด {dataAmount} รายการใช่หรือไม่
            </p>
          </div>
          <span className="w-full flex gap-3 justify-end">
            <button
              className=" w-[100px] bg-red-100 hover:bg-red-200 duration-500 text-red-500 py-2 px-4 rounded"
              onClick={() => cancel()}
            >
              ยกเลิก
            </button>
            <button
              className=" w-[100px] bg-gray-100 hover:bg-gray-200 duration-500 text-gray-500 py-2 px-4 rounded"
              onClick={() => confirmed()}
            >
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
export default ConfirmDeleteModal;
