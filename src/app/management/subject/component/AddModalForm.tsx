import React, { useState } from "react";
import TextField from "@/components/mui/TextField";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import type { subject } from "@prisma/client";
import { subject_credit } from "@prisma/client";
import { subjectCreditTitles } from "@/models/credit-titles";
import api from "@/libs/axios";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  mutate: Function;
};
function AddModalForm({ closeModal, mutate }: props) {
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [subjects, setSubjects] = useState<subject[]>([
    {
      SubjectCode: "",
      SubjectName: "",
      Credit: undefined,
      Category: "",
      ProgramID: undefined,
    },
  ]);

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
  const addData = async (data: subject[]) => {
    const loadbar = enqueueSnackbar("กำลังเพิ่มวิชา", {
      variant: "info",
      persist: true,
    });
    data.forEach((subject) => {
      subject.Credit = selectCredit(subject.Credit);
    });
    await api
      .post("/subject", data)
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("เพิ่มวิชาสำเร็จ", { variant: "success" });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        console.log(error.response.data);
        enqueueSnackbar("เพิ่มวิชาไม่สำเร็จ " + error.response.data, {
          variant: "error",
        });
      });
  };

  const addList = () => {
    let struct: subject = {
      SubjectCode: "",
      SubjectName: "",
      Credit: undefined,
      Category: "",
      ProgramID: undefined,
    };
    setSubjects(() => [...subjects, struct]);
  };
  const removeList = (index: number): void => {
    setSubjects(() => subjects.filter((_, ind) => ind !== index));
  };
  const isValidData = (): boolean => {
    let isValid = true;
    subjects.forEach((data) => {
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
  const handleSubmit = () => {
    if (isValidData()) {
      addData(subjects);
      closeModal();
    }
  };
  const cancel = () => {
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
            subjects.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">เพิ่มรายวิชา</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex justify-between items-center">
            <MiniButton
              title="เพิ่มรายการ"
              titleColor="#000000"
              buttonColor="#FFFFFF"
              border={true}
              hoverable={true}
              borderColor="#222222"
              handleClick={addList}
            />
          </div>
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            {subjects.map((subject, index) => (
              <React.Fragment key={`AddData${index + 1}`}>
                <div
                  className={`flex flex-row gap-3 items-center ${
                    index == subjects.length - 1 ? "" : "mt-8"
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
                      placeHolder="ex. ท00000"
                      label="รหัสวิชา (SubjectCode) :"
                      value={subject.SubjectCode}
                      borderColor={
                        isEmptyData && subject.SubjectCode.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setSubjects(() =>
                          subjects.map((item, ind) =>
                            index === ind
                              ? { ...item, SubjectCode: value }
                              : item,
                          ),
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
                      placeHolder="ex. ภาษาไทย1"
                      label="ชื่อวิชา (SubjectName) :"
                      value={subject.SubjectName}
                      borderColor={
                        isEmptyData && subject.SubjectName.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setSubjects(() =>
                          subjects.map((item, ind) =>
                            index === ind
                              ? { ...item, SubjectName: value }
                              : item,
                          ),
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
                      renderItem={({ data }: { data: any }): JSX.Element => (
                        <li className="w-full">{subjectCreditTitles[data]}</li>
                      )}
                      width={150}
                      height={40}
                      currentValue={subject.Credit}
                      placeHolder={"ตัวเลือก"}
                      borderColor={
                        isEmptyData && subject.Credit.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(value: string) => {
                        setSubjects(() =>
                          subjects.map((item, ind) =>
                            index === ind
                              ? { ...item, Credit: subjectCreditTitles[value] }
                              : item,
                          ),
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
                      สาระการเรียนรู้ (Category):
                    </label>
                    <Dropdown
                      data={["พื้นฐาน", "เพิ่มเติม", "กิจกรรมพัฒนาผู้เรียน"]}
                      renderItem={({ data }: { data: any }): JSX.Element => (
                        <li className="w-full">{data}</li>
                      )}
                      width={150}
                      height={40}
                      currentValue={subject.Category}
                      borderColor={
                        isEmptyData && subject.Category.length == 0
                          ? "#F96161"
                          : ""
                      }
                      placeHolder={"ตัวเลือก"}
                      handleChange={(value: string) => {
                        setSubjects(() =>
                          subjects.map((item, ind) =>
                            index === ind ? { ...item, Category: value } : item,
                          ),
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

                  {subjects.length > 1 ? (
                    <TbTrash
                      size={20}
                      className="mt-6 text-red-400 cursor-pointer"
                      onClick={() => removeList(index)}
                    />
                  ) : null}
                </div>
              </React.Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end mt-5 gap-3 h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />} reverseIcon={false} isDisabled={false}
            />
            <PrimaryButton
              handleClick={handleSubmit}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />} reverseIcon={false} isDisabled={false}
            />
          </span>
        </div>
      </div>
    </>
  );
}

export default AddModalForm;
