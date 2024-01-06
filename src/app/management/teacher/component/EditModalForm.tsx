import TextField from "@/components/elements/input/field/TextField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";

import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfo } from "react-icons/bs";
import { Teacher } from "../model/teacher";
import api from "@/libs/axios";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

type props = {
  closeModal: any;
  openSnackBar: any;
  data: Teacher[];
  clearCheckList: any;
  mutate: Function;
};

function EditModalForm({
  closeModal,
  data,
  clearCheckList,
  openSnackBar,
  mutate,
}: props) {
  const [editData, setEditData] = useState<Teacher[]>(Object.assign([], data));
  const [isEmptyData, setIsEmptyData] = useState(false);

  const editMultiData = async (data: any) => {
    console.log(data);
    try {
      const response = await api.put("/teacher", data);
      if (response.status === 200) {
        mutate();
        openSnackBar("EDIT");
      }

      //clear checkbox
      clearCheckList();
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  const isValidData = (): boolean => {
    let isValid = true;
    editData.forEach((data) => {
      if (
        data.Prefix == "" ||
        data.Firstname == "" ||
        data.Lastname == "" ||
        data.Department == ""
      ) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const confirmed = () => {
    if (isValidData()) {
      editMultiData(editData);
      closeModal();
    }
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
            <p className="text-lg select-none">แก้ไขข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={cancelEdit} />
          </div>
          {editData.map((item: any, index: number) => (
            <React.Fragment key={`Edit${index}`}>
              <div
                className={`flex flex-row gap-3 items-center ${
                  index == 0 ? "" : "mt-1"
                }`}
              >
                <div className="flex flex-col items-center justify-center mr-5">
                  <p className="text-sm font-bold">รายการที่</p>
                  <p>{index + 1}</p>
                </div>
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm font-bold">
                    คำนำหน้าชื่อ (Prefix):
                  </label>
                  <Dropdown
                    data={["นาย", "นาง", "นางสาว"]}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={item.Prefix}
                    borderColor={
                      isEmptyData && item.Prefix.length == 0 ? "#F96161" : ""
                    }
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Prefix: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && item.Prefix.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 h-30 relative">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`ชื่อ (Firstname):`}
                    value={item.Firstname}
                    borderColor={
                      isEmptyData && item.Firstname.length == 0 ? "#F96161" : ""
                    }
                    handleChange={(e: any) => {
                      let value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Firstname: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && item.Firstname.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 h-30 relative">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`นามสกุล (Lastname):`}
                    value={item.Lastname}
                    borderColor={
                      isEmptyData && item.Lastname.length == 0 ? "#F96161" : ""
                    }
                    handleChange={(e: any) => {
                      let value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Lastname: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && item.Lastname.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="relative flex flex-col gap-2">
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
                    ]}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={item.Department}
                    borderColor={
                      isEmptyData && item.Department.length == 0
                        ? "#F96161"
                        : ""
                    }
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Department: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && item.Department.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </React.Fragment>
          ))}
          <span className="w-full flex gap-3 justify-end mt-5 h-11">
            <PrimaryButton
              handleClick={cancelEdit}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />}
            />
            <PrimaryButton
              handleClick={confirmed}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />}
            />
          </span>
        </div>
      </div>
    </>
  );
}
export default EditModalForm;
