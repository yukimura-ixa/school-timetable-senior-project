import React, { useEffect, useState, Fragment, type JSX } from "react";
import TextField from "@/components/mui/TextField";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import type { teacher } from "@/prisma/generated/client";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { CircularProgress } from "@mui/material";

// Server Actions
import { createTeachersAction } from "@/features/teacher/application/actions/teacher.actions";

// Form state type allowing null for new entries
type TeacherFormState = {
  TeacherID: number | null;
  Prefix: string;
  Firstname: string;
  Lastname: string;
  Department: string;
  Email: string;
  Role: string;
};

type props = {
  closeModal: () => void;
  mutate: () => void | Promise<void>;
};
function AddModalForm({ closeModal, mutate }: props) {
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateTempTeacherEmail = () => {
    try {
      return `new_teacher_${crypto.randomUUID()}@school.local`;
    } catch {
      return `new_teacher_${Date.now()}@school.local`;
    }
  };
  const [teachers, setTeachers] = useState<TeacherFormState[]>([
    {
      TeacherID: null,
      Prefix: "นาย",
      Firstname: "",
      Lastname: "",
      Department: "คณิตศาสตร์",
      Email: "",
      Role: "teacher",
    },
  ]);

  useEffect(() => {
    setTeachers((prev) =>
      prev.map((t) => (t.Email ? t : { ...t, Email: generateTempTeacherEmail() })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addData = async (data: TeacherFormState[]) => {
    const loadbar = enqueueSnackbar("กำลังเพิ่มข้อมูลครู", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await createTeachersAction(
        data.map((t) => ({
          Prefix: t.Prefix || "นาย",
          Firstname: t.Firstname,
          Lastname: t.Lastname,
          Department: t.Department || "คณิตศาสตร์",
          Email: t.Email,
          Role: t.Role || "teacher",
        })),
      );

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar("เพิ่มข้อมูลครูสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "เพิ่มข้อมูลครูไม่สำเร็จ: " + (error.message || "Unknown error"),
        {
          variant: "error",
        },
      );
      console.log(error);
    }
  };
  const addList = () => {
    const newTeacher: TeacherFormState = {
      TeacherID: null,
      Prefix: "นาย",
      Firstname: "",
      Lastname: "",
      Department: "คณิตศาสตร์",
      Email: generateTempTeacherEmail(),
      Role: "teacher",
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };
  const removeList = (index: number): void => {
    const copyArray = [...teachers];
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
                      testId={`prefix-${index}`}
                      data={["นาย", "นาง", "นางสาว"]}
                      renderItem={({
                        data,
                      }: {
                        data: unknown;
                      }): JSX.Element => (
                        <li className="w-full">{data as string}</li>
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
                      handleChange={(value: unknown) => {
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind
                              ? { ...item, Prefix: value as string }
                              : item,
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
                      inputProps={{ "data-testid": `firstname-${index}` }}
                      borderColor={
                        isEmptyData && teacher.Firstname.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        const value: string = e.target.value;
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
                      inputProps={{ "data-testid": `lastname-${index}` }}
                      borderColor={
                        isEmptyData && teacher.Lastname.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        const value: string = e.target.value;
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
                      testId={`department-${index}`}
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
                      renderItem={({
                        data,
                      }: {
                        data: unknown;
                      }): JSX.Element => (
                        <li className="w-full">{data as string}</li>
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
                      handleChange={(value: unknown) => {
                        setTeachers(() =>
                          teachers.map((item, ind) =>
                            index === ind
                              ? { ...item, Department: value as string }
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
                      inputProps={{ "data-testid": `email-${index}` }}
                      borderColor={
                        isEmptyData && teacher.Email.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        const value: string = e.target.value;
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
              data-testid="add-teacher-cancel"
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />}
              reverseIcon={false}
              isDisabled={isSubmitting}
            />
            <PrimaryButton
              data-testid="add-teacher-submit"
              handleClick={handleSubmit}
              title={isSubmitting ? "" : "ยืนยัน"}
              color={"success"}
              Icon={
                isSubmitting ? <CircularProgress size={20} /> : <CheckIcon />
              }
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
