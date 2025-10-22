import React, { useState, Fragment } from "react";
import TextField from "@/components/mui/TextField";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import type { teacher } from "@prisma/client";
import api from "@/libs/axios";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { CircularProgress } from "@mui/material";
type props = {
  closeModal: any;
  mutate: Function;
};
function AddModalForm({ closeModal, mutate }: props) {
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<teacher[]>([
    {
      TeacherID: null,
      Prefix: "",
      Firstname: "",
      Lastname: "",
      Department: "",
      Email: "",
      Role: "teacher",
    },
  ]);

  const addData = async (data: teacher[]) => {
    const loadbar = enqueueSnackbar("กำลังเพิ่มข้อมูลครู", {
      variant: "info",
      persist: true,
    });
    const response = await api
      .post("/teacher", data)
      .then(() => {
        closeSnackbar(loadbar);
        enqueueSnackbar("เพิ่มข้อมูลครูสำเร็จ", { variant: "success" });
        mutate();
      })
      .catch((error) => {
        closeSnackbar(loadbar);
        enqueueSnackbar("เพิ่มข้อมูลครูไม่สำเร็จ " + error.respnse.data, {
          variant: "error",
        });
        console.log(error);
      });
    console.log(response);
  };
  const addList = () => {
    let newTeacher: teacher = {
      TeacherID: null,
      Prefix: "",
      Firstname: "",
      Lastname: "",
      Department: "",
      Email: "",
      Role: "teacher",
    };
    setTeachers(() => [...teachers, newTeacher]);
  };
  const removeList = (index: number): void => {
    let copyArray = [...teachers];
    copyArray.splice(index, 1);
    setTeachers(() => copyArray);
  };
  const isValidData = (): boolean => {
    let isValid = true;
    teachers.forEach((data) => {
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
  const handleSubmit = async () => {
    if (isValidData()) {
      setIsSubmitting(true);
      try {
        await addData(teachers);
        closeModal();
      } finally {
        setIsSubmitting(false);
      }
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
            teachers.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">เพิ่มรายชื่อครู</p>
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
              width={""}
              height={""}
              isSelected={false}
            />
          </div>
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            {teachers.map((teacher, index) => (
              <Fragment key={`${index + 1}`}>
                <div
                  className={`flex flex-row gap-3 items-center ${
                    index == teachers.length - 1 ? "" : "mt-8"
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
                      borderColor={
                        isEmptyData && teacher.Prefix.length == 0
                          ? "#F96161"
                          : ""
                      }
                      currentValue={teacher.Prefix}
                      placeHolder={"ตัวเลือก"}
                      handleChange={(value: string) => {
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind ? { ...item, Prefix: value } : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData && teacher.Prefix.length == 0 ? (
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
                      placeHolder="ex. อเนก"
                      label="ชื่อ (Firstname) :"
                      value={teacher.Firstname}
                      borderColor={
                        isEmptyData && teacher.Firstname.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind
                              ? { ...item, Firstname: value }
                              : item,
                          ),
                        );
                      }}
                      disabled={false}
                    />
                    {isEmptyData && teacher.Firstname.length == 0 ? (
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
                      placeHolder="ex. ประสงค์"
                      label="นามสกุล (Lastname) :"
                      value={teacher.Lastname}
                      borderColor={
                        isEmptyData && teacher.Lastname.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind ? { ...item, Lastname: value } : item,
                          ),
                        );
                      }}
                      disabled={false}
                    />
                    {isEmptyData && teacher.Lastname.length == 0 ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative flex flex-col gap-2 h-30">
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
                      currentValue={teacher.Department}
                      placeHolder={"ตัวเลือก"}
                      // #F96161 --red
                      borderColor={
                        isEmptyData && teacher.Department.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(value: string) => {
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind
                              ? { ...item, Department: value }
                              : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData && teacher.Department.length == 0 ? (
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
                      value={teacher.Email}
                      borderColor={
                        isEmptyData && teacher.Email.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind ? { ...item, Email: value } : item,
                          ),
                        );
                      }}
                      disabled={false}
                    />
                    {isEmptyData && teacher.Email.length == 0 ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  {teachers.length > 1 ? (
                    <TbTrash
                      size={20}
                      className="mt-6 text-red-400 cursor-pointer"
                      onClick={() => removeList(index)}
                    />
                  ) : null}
                </div>
              </Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end mt-5 gap-3 h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />} 
              reverseIcon={false} 
              isDisabled={isSubmitting}
            />
            <PrimaryButton
              handleClick={handleSubmit}
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

export default AddModalForm;
