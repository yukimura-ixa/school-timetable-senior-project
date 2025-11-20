import TextField from "@/components/mui/TextField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";

import React, { useState, type JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfo } from "react-icons/bs";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import type { teacher } from '@/prisma/generated/client';;
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { CircularProgress } from "@mui/material";

// Server Actions
import { updateTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

type props = {
  closeModal: any;
  data: teacher[];
  clearCheckList: any;
  mutate: Function;
};

function EditModalForm({ closeModal, data, clearCheckList, mutate }: props) {
  const [editData, setEditData] = useState<teacher[]>(Object.assign([], data));
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editMultiData = async (data: any) => {
    const loadbar = enqueueSnackbar("กำลังแก้ไขข้อมูลครู", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await updateTeachersAction({
        teachers: data.map((t: teacher) => ({
          TeacherID: t.TeacherID,
          Prefix: t.Prefix,
          Firstname: t.Firstname,
          Lastname: t.Lastname,
          Department: t.Department,
          Email: t.Email,
          Role: t.Role || "teacher",
        })),
      });
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      
      closeSnackbar(loadbar);
      enqueueSnackbar("แก้ไขข้อมูลครูสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar("แก้ไขข้อมูลครูไม่สำเร็จ: " + (error.message || "Unknown error"), {
        variant: "error",
      });
      console.log(error);
    }

    //clear checkbox
    clearCheckList();
  };
  const isValidData = (): boolean => {
    let isValid = true;
    editData.forEach((data) => {
      if (
        data.Prefix == "" ||
        data.Firstname == "" ||
        data.Lastname == "" ||
        data.Department == "" ||
        data.Email == ""
      ) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const confirmed = async () => {
    if (isValidData()) {
      setIsSubmitting(true);
      try {
        await editMultiData(editData);
        closeModal();
      } finally {
        setIsSubmitting(false);
      }
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
                    renderItem={({ data }: { data: any }): JSX.Element => (
                      <li className="w-full">{data}</li>
                    )}
                    width={150}
                    height={40}
                    currentValue={item.Prefix}
                    borderColor={
                      isEmptyData && item.Prefix.length == 0 ? "#F96161" : ""
                    }
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: unknown) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Prefix: value as string } : item,
                        ),
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
                      const value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Firstname: value } : item,
                        ),
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
                      const value = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Lastname: value } : item,
                        ),
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
                      "วิทยาศาสตร์และเทคโนโลยี",
                      "ภาษาไทย",
                      "ภาษาต่างประเทศ",
                      "การงานอาชีพ",
                      "ศิลปะ",
                      "สังคมศึกษา ศาสนา และวัฒนธรรม",
                      "สุขศึกษาและพลศึกษา",
                    ]}
                    renderItem={({ data }: { data: any }): JSX.Element => (
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
                    handleChange={(value: unknown) => {
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Department: value as string } : item,
                        ),
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
                <div className="flex flex-col gap-2 h-30 relative">
                  <TextField
                    width="auto"
                    height="auto"
                    placeHolder="ex. example@example.com"
                    label="อีเมล (Email) :"
                    value={item.Email}
                    borderColor={
                      isEmptyData && item.Email.length == 0 ? "#F96161" : ""
                    }
                    handleChange={(e: any) => {
                      const value: string = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Email: value } : item,
                        ),
                      );
                    }}
                    disabled={false}
                  />
                  {isEmptyData && item.Email.length == 0 ? (
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
              reverseIcon={false} 
              isDisabled={isSubmitting}
            />
            <PrimaryButton
              handleClick={confirmed}
              title={isSubmitting ? "" : "ยืนยัน"}
              color={"success"}
              Icon={isSubmitting ? <CircularProgress size={20} /> : <CheckIcon />} 
              reverseIcon={false} 
              isDisabled={isSubmitting}
            />
          </span>
        </div>
      </div>
    </>
  );
}
export default EditModalForm;
