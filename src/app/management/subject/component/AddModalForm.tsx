import Image from "next/image";
import React, { useState } from "react";
import closeicon from "@/svg/closeicon.svg";
import TextField from "@/components/elements/input/field/TextField";
import Button from "@/components/elements/static/Button";
import { AiOutlineClose } from 'react-icons/ai';
type props = {
  closeModal: any;
  addData: any;
};
function AddModalForm({ closeModal, addData }: props) {
  const [subjectID, setSubjectID] = useState<string>("");
  const [subjectName, setSubjectName] = useState<string>("");
  const [credit, setCredit] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const handleChangeSubjectID = (event: any) => {
    setSubjectID(() => event.target.value);
  };
  const handleChangeSubjectName = (event: any) => {
    setSubjectName(() => event.target.value);
  };
  const handleChangeCredit = (event: any) => {
    setCredit(() => event.target.value);
  };
  const handleChangeCategory = (event: any) => {
    setCategory(() => event.target.value);
  };
  const handleSubmit = () => {
    type subject = {
      SubjectID: string;
      SubjectName: string;
      Credit: string;
      Category: string;
    };
    const subjectData: subject = {
      SubjectID: subjectID,
      SubjectName: subjectName,
      Credit: credit,
      Category: category,
    };
    addData(subjectData);
    setSubjectID(""), setSubjectName(""), setCredit(""), setCategory("");
    closeModal();
  };
  const handleEnterKeyDown = (event:any) => {
    if(event.key === 'Enter') {
      handleSubmit();
    }
  }
  return (
    <>
      <div
        onKeyDown={handleEnterKeyDown}
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[550px] h-auto p-[50px] gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">เพิ่มรายชื่อครู</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} /> 
          </div>
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            <TextField
              width="auto"
              height="auto"
              placeHolder="ex. ค12102"
              label="รหัสวิชา (SubjectID) :"
              handleChange={handleChangeSubjectID}
            />
            <TextField
              width="auto"
              height="auto"
              placeHolder="ex. คณิตศาสตร์พื้นฐาน"
              label="ชื่อวิชา (SubjectName) :"
              handleChange={handleChangeSubjectName}
            />
            <TextField
              width="auto"
              height="auto"
              placeHolder="ex. 1.5"
              label="หน่วยกิต (Credit) :"
              handleChange={handleChangeCredit}
            />
            <TextField
              width="auto"
              height="auto"
              placeHolder="ex. คณิตศาสตร์"
              label="กลุ่มสาระ (Category) :"
              handleChange={handleChangeCategory}
            />
            <span className="w-full flex justify-end mt-5">
              {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
              <button className=" w-[150px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded" onClick={handleSubmit}>
                ยืนยัน
              </button>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddModalForm;
