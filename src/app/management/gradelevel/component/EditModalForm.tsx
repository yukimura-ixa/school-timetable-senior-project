import NumberField from "@/components/elements/input/field/NumberField";
import TextField from "@/components/elements/input/field/TextField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type props = {
  closeModal: any;
  conFirmEdit: any;
  data: any;
};

const EditModalForm = ({ closeModal, conFirmEdit, data }: props) => {
  const [confirmText, setConfirmText] = useState<string>("");
  const [editData, setEditData] = useState<[]>(data);

  const handleChangeGradeLevelID = (value:string, index:number) => {
    editData[index].GradeLevelID = value
    setEditData([...editData]);
  };
  const handleChangeYear = (value:string, index:number) => {
    editData[index].Year = value
    setEditData([...editData]);
  };
  const handleChangeNumber = (value:string, index:number) => {
    editData[index].Number = value
    setEditData([...editData]);
  };
  const handleChangeProgram = (value:string, index:number) => {
    editData[index].Program = value
    setEditData([...editData]);
  };
  const handleChangeConfirmText = (event: any) => {
    setConfirmText(() => event.target.value);
  };
  const confirmed = () => {
    if (confirmText === "ยืนยัน") {
      conFirmEdit(editData);
      closeModal();
    }
  };
  const handleEnterKeyDown = (event:any) => {
    if(event.key === 'Enter') {
      confirmed();
    }
  }
  return (
    <>
      <div
        onKeyDown={handleEnterKeyDown}
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className={`relative flex flex-col w-auto ${data.length > 5 ? 'h-[700px]' : 'h-auto'} overflow-y-scroll overflow-x-hidden p-[50px] gap-10 bg-white rounded`}>
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p
              className="text-lg select-none"
              onClick={() => console.log(data)}
            >
              แก้ไขข้อมูล
            </p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          {editData.map((item:any, index:number) => (
            <>
              <div className="flex flex-row gap-3 h-14 w-full">
                {/* <TextField
                  width="auto"
                  height="auto"
                  label={`รหัสประจำตัว`}
                  value={item.TeacherID}
                  // handleChange={}
                /> */}
                <div className="flex flex-col items-center justify-between mr-5">
                    <p className="text-sm font-bold">รายการ</p>
                    <p>{index+1}</p>
                </div>
                <TextField
                  width="auto"
                  height="auto"
                  label={`รหัสชั้นเรียน`}
                  value={item.GradeLevelID}
                  handleChange={(e:any) => {
                    handleChangeGradeLevelID(e.target.value, index)
                  }}
                />
                <NumberField
                  width="auto"
                  height="auto"
                  label={`มัธยมปีที่`}
                  value={item.Year}
                  handleChange={(e:any) => {
                    handleChangeYear(e.target.value, index)
                  }}
                />
                <NumberField
                  width="auto"
                  height="auto"
                  label={`ห้อง`}
                  value={item.Number}
                  handleChange={(e:any) => {
                    handleChangeNumber(e.target.value, index)
                  }}
                />
                <TextField
                  width="auto"
                  height="auto"
                  label={`สายการเรียน`}
                  value={item.Program}
                  handleChange={(e:any) => {
                    handleChangeProgram(e.target.value, index)
                  }}
                />
              </div>
            </>
          ))}
          {/* inputfield */}
          <div className="flex flex-col gap-3 mt-3">
            <TextField
              width="auto"
              height="auto"
              placeHolder="ยืนยัน"
              label={`พิมพ์ "ยืนยัน" เพื่อแก้ไขข้อมูลที่เลือกทั้งหมด ${data.length} รายการ`}
              handleChange={handleChangeConfirmText}
            />
            {confirmText === "ยืนยัน" ? (
              <span className="w-full flex justify-end mt-5">
                {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
                <button
                  className=" w-[150px] bg-yellow-400 hover:bg-yellow-500 duration-500 text-white py-2 px-4 rounded"
                  onClick={() => confirmed()}
                >
                  ยืนยัน
                </button>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};
export default EditModalForm;
