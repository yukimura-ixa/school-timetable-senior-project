import TextField from "@/components/elements/input/field/TextField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";

import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

type props = {
  closeModal: any;
  conFirmEdit: any;
  data: any;
  clearCheckList: any;
};

const EditModalForm = ({
  closeModal,
  conFirmEdit,
  data,
  clearCheckList,
}: props) => {
  const [editData, setEditData] = useState<subject[]>(Object.assign([], data));
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
                  label={`รหัสวิชา (SubjectCode):`}
                  placeHolder="ex. ท00000"
                  value={item.SubjectCode}
                  handleChange={(e: any) => {
                    let value = e.target.value;
                    setEditData(() =>
                      editData.map((item, ind) =>
                        index === ind ? { ...item, SubjectCode: value } : item
                      )
                    );
                  }}
                />
                <TextField
                  width="auto"
                  height="auto"
                  label={`ชื่อวิชา (SubjectName):`}
                  placeHolder="ex. ภาษาไทย 1"
                  value={item.SubjectName}
                  handleChange={(e: any) => {
                    let value = e.target.value;
                    setEditData(() =>
                      editData.map((item, ind) =>
                        index === ind ? { ...item, SubjectName: value } : item
                      )
                    );
                  }}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">
                    หน่วยกิต (Credit):
                  </label>
                  <Dropdown
                    data={[
                      "0.5",
                      "1.0",
                      "1.5",
                      "2.0"
                    ]}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={item.Credit}
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) => index === ind ? { ...item, Credit: value } : item)
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold">
                    กลุ่มสาระ (Department):
                  </label>
                  <Dropdown
                    data={[
                      "คณิตศาสตร์",
                      "วิทยาศาสตร์",
                      "ภาษาไทย",
                      "ภาษาต่างประเทศ",
                      "การงานอาชีพและเทคโนโลยี",
                      "ศิลปะ",
                      "สังคมศึกษา ศาสนา และวัฒนธรรม",
                      "สุขศึกษาและพลศึกษา",
                      "กิจกรรม",
                      "ชุมนุม",
                      "เสรี"
                    ]}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={item.Category}
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Category: value } : item
                        )
                      );
                    }}
                  />
                </div>
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
