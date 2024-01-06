import TextField from "@/components/elements/input/field/TextField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import type { subject } from "@prisma/client";
import { BsInfo } from "react-icons/bs";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import api from "@/libs/axios";
import { subject_credit } from "@prisma/client";
import { subjectCreditTitles } from "@/models/credit-titles";

type props = {
  closeModal: any;
  data: any;
  clearCheckList: any;
  openSnackBar: any;
  mutate: Function;
};

function EditModalForm({
  closeModal,
  data,
  clearCheckList,
  openSnackBar,
  mutate,
}: props) {
  const [editData, setEditData] = useState<subject[]>(Object.assign([], data));
  const [isEmptyData, setIsEmptyData] = useState(false);
  const isValidData = (): boolean => {
    let isValid = true;
    editData.forEach((data) => {
      if (
        data.SubjectCode == "" ||
        data.SubjectName == "" ||
        data.Credit == "" ||
        data.Category == ""
      ) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const selectCredit = (value: string): subject_credit => {
    switch (value) {
      case "0.5":
        return subject_credit.CREDIT_05;
      case "1.0":
        return subject_credit.CREDIT_10;
      case "1.5":
        return subject_credit.CREDIT_15;
      case "2.0":
        return subject_credit.CREDIT_20;
      default:
        return subject_credit.CREDIT_05;
    }
  };
  const editMultiData = async (data: any) => {
    console.log(data);
    try {
      data.forEach((subject) => {
        subject.Credit = selectCredit(subject.Credit);
      });
      const response = await api.put("/subject", data);
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
          {editData.map((subject: subject, index: number) => (
            <React.Fragment key={`Edit${index}`}>
              <div
                className={`flex flex-row gap-3 items-center ${
                  index == 0 ? "" : "mt-2"
                }`}
              >
                <div className="flex flex-col items-center justify-center mr-5">
                  <p className="text-sm font-bold">รายการที่</p>
                  <p>{index + 1}</p>
                </div>
                <div className="relative flex flex-col gap-2">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`รหัสวิชา (SubjectCode):`}
                    placeHolder="ex. ท00000"
                    value={subject.SubjectCode}
                    borderColor={
                      isEmptyData && subject.SubjectCode.length == 0
                        ? "#F96161"
                        : ""
                    }
                    handleChange={(e: any) => {
                      let value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, SubjectCode: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && subject.SubjectCode.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="relative flex flex-col gap-2">
                  <TextField
                    width="auto"
                    height="auto"
                    label={`ชื่อวิชา (SubjectName):`}
                    placeHolder="ex. ภาษาไทย 1"
                    value={subject.SubjectName}
                    borderColor={
                      isEmptyData && subject.SubjectName.length == 0
                        ? "#F96161"
                        : ""
                    }
                    handleChange={(e: any) => {
                      let value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, SubjectName: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && subject.SubjectName.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div>
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm font-bold">
                    หน่วยกิต (Credit):
                  </label>
                  <Dropdown
                    data={Object.values(subject_credit)}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{subjectCreditTitles[data]}</li>
                    )}
                    width={150}
                    height={40}
                    borderColor={
                      isEmptyData && subject.Credit.length == 0 ? "#F96161" : ""
                    }
                    currentValue={
                      subjectCreditTitles[subject.Credit] || subject.Credit
                    }
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind
                            ? { ...item, Credit: subjectCreditTitles[value] }
                            : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && subject.Credit.length == 0 ? (
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
                      "กิจกรรม",
                      "ชุมนุม",
                      "เสรี",
                    ]}
                    borderColor={
                      isEmptyData && subject.Category.length == 0
                        ? "#F96161"
                        : ""
                    }
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={subject.Category}
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: string) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Category: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && subject.Category.length == 0 ? (
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
