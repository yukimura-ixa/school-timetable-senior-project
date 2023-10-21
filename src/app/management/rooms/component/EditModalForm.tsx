import NumberField from "@/components/elements/input/field/NumberField";
import TextField from "@/components/elements/input/field/TextField";

import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type props = {
  closeModal: any;
  conFirmEdit: any;
  data: any;
  clearCheckList: any;
};

function EditModalForm ({
  closeModal,
  conFirmEdit,
  data,
  clearCheckList,
}: props) {
  const [editData, setEditData] = useState<rooms[]>(data);
  const confirmed = () => {
    conFirmEdit(editData);
    closeModal();
  };
  const cancelEdit = () => {
    if (data.length === 1) {
      clearCheckList();
    }
    closeModal();
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-fit ${
            data.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p
              className="text-lg select-none"
            >
              แก้ไขข้อมูล
            </p>
            <AiOutlineClose className="cursor-pointer" onClick={cancelEdit} />
          </div>
          {editData.map((item: any, index: number) => (
            <React.Fragment key={`Edit${index}`}>
              <div className="flex flex-row gap-3 h-14 w-full">
                <div className="flex flex-col items-center justify-center mr-5">
                  <p className="text-sm font-bold">รายการที่</p>
                  <p>{index + 1}</p>
                </div>
                <TextField
                  width="auto"
                  height="auto"
                  label={`ชื่อห้อง (RoomName):`}
                  placeHolder="ex. คอม1"
                  value={item.RoomName}
                  handleChange={(e: any) => {
                    let value:string = e.target.value;
                    setEditData(() =>
                      editData.map((item, ind) =>
                        index === ind ? { ...item, RoomName: value } : item
                      )
                    );
                  }}
                />
                <TextField
                  width="auto"
                  height="auto"
                  label={`อาคาร (Building):`}
                  placeHolder="ex. 3"
                  value={item.Building}
                  handleChange={(e: any) => {
                    let value:string = e.target.value;
                    setEditData(() =>
                      editData.map((item, ind) =>
                        index === ind ? { ...item, Building: value } : item
                      )
                    );
                  }}
                />
                <NumberField
                  width="auto"
                  height="auto"
                  label={`ชั้น (Floor):`}
                  placeHolder="ex. 5"
                  value={item.Floor}
                  handleChange={(e: any) => {
                    let value:number = e.target.value;
                    setEditData(() =>
                      editData.map((item, ind) =>
                        index === ind ? { ...item, Floor: value } : item
                      )
                    );
                  }}
                />
              </div>
            </React.Fragment>
          ))}
          <span className="w-full flex gap-3 justify-end mt-5">
            <button
              className=" w-[100px] bg-red-500 hover:bg-red-600 duration-500 text-white py-2 px-4 rounded"
              onClick={() => cancelEdit()}
            >
              ยกเลิก
            </button>
            <button
              className=" w-[100px] bg-emerald-500 hover:bg-emerald-600 duration-500 text-white py-2 px-4 rounded"
              onClick={() => confirmed()}
            >
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
};
export default EditModalForm;
