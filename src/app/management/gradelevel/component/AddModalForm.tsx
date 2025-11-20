import React, { useState, Fragment, type JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import NumberField from "@/components/elements/input/field/NumberField";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { createGradeLevelsAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import type { gradelevel } from '@/prisma/generated/client';;
import type { CreateGradeLevelsInput } from "@/features/gradelevel/application/schemas/gradelevel.schemas";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type Props = {
  closeModal: () => void;
  mutate: () => void;
};
function AddModalForm({ closeModal, mutate }: Props) {
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [gradeLevels, setGradeLevels] = useState<Partial<gradelevel>[]>([
    {
      Year: null as unknown as number,
      Number: null as unknown as number,
    },
  ]);
  const addList = () => {
    const struct: Partial<gradelevel> = {
      Year: null as unknown as number,
      Number: null as unknown as number,
    };
    setGradeLevels(() => [...gradeLevels, struct]);
  };
  const removeList = (index: number): void => {
    const copyArray = [...gradeLevels];
    copyArray.splice(index, 1);
    setGradeLevels(() => copyArray);
  };
  const isValidData = (): boolean => {
    let isValid = true;
    gradeLevels.forEach((data) => {
      if (data.Year === null || data.Number === null) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const addData = async (data: Partial<gradelevel>[]) => {
    const loadbar = enqueueSnackbar("กำลังเพิ่มข้อมูลชั้นเรียน", {
      variant: "info",
      persist: true,
    });
    
    try {
      const payload: CreateGradeLevelsInput = data
        .filter((d): d is { Year: number; Number: number } =>
          d.Year !== null && d.Year !== undefined && d.Number !== null && d.Number !== undefined
        )
        .map((d) => ({ Year: Number(d.Year), Number: Number(d.Number) }));
      const result = await createGradeLevelsAction(payload);
      
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }
      
      closeSnackbar(loadbar);
      enqueueSnackbar("เพิ่มข้อมูลชั้นเรียนสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      closeSnackbar(loadbar);
      enqueueSnackbar("เพิ่มข้อมูลชั้นเรียนไม่สำเร็จ " + message, {
        variant: "error",
      });
      console.error(error);
    }
  };
  
  const handleSubmit = async () => {
    if (isValidData()) {
      await addData(gradeLevels);
      closeModal();
    }
  };
  const cancel = () => {
    closeModal();
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-fit ${
            gradeLevels.length > 5 ? "h-[700px]" : "h-auto"
          } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">เพิ่มชั้นเรียน</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <MiniButton
            title="เพิ่มรายการ"
            titleColor="#000000"
            buttonColor="#FFFFFF"
            border={true}
            hoverable={true}
            borderColor="#222222"
            width="auto"
            height={30}
            isSelected={false}
            handleClick={addList}
          />
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            {gradeLevels.map((gradeLevel, index) => (
              <Fragment key={`AddData${index + 1}`}>
                <div
                  className={`flex flex-row gap-3 items-center ${
                    index === gradeLevels.length - 1 ? "" : "mt-8"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center mr-5">
                    <p
                      className="text-sm font-bold"
                    >
                      รายการที่
                    </p>
                    <p>{index + 1}</p>
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <label className="text-sm font-bold">
                      มัธยมปีที่ (Year):
                    </label>
                    <Dropdown
                      data={[1, 2, 3, 4, 5, 6]}
                      renderItem={({ data }: { data: unknown }): JSX.Element => {
                        const year = data as number;
                        return <li className="w-full">{year}</li>;
                      }}
                      width={150}
                      height={40}
                      currentValue={String(gradeLevel.Year)}
                      placeHolder={"ตัวเลือก"}
                      handleChange={(value: unknown) => {
                        const year = value as number;
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind ? { ...item, Year: year } : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData &&
                    (gradeLevel.Year === 0 || gradeLevel.Year === null) ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <NumberField
                      width="auto"
                      height="auto"
                      placeHolder="ex. 5"
                      label="ห้องที่ (Number):"
                      value={gradeLevel.Number}
                      disabled={false}
                      borderColor={
                        isEmptyData &&
                        (gradeLevel.Number === 0 || gradeLevel.Number === null)
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value: string = e.target.value;
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind
                              ? { ...item, Number: parseInt(value) || undefined }
                              : item,
                          ),
                        );
                      }}
                    />
                    {isEmptyData &&
                    (gradeLevel.Number === 0 || gradeLevel.Number === null) ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>

                  {!gradeLevel.Year || !gradeLevel.Number ? null : (
                    <p className="relative flex flex-col gap-2 mt-7 text-gray-400">
                      ชั้น ม.{gradeLevel.Year + "/" + gradeLevel.Number}
                    </p>
                  )}
                  {/* <div className="relative flex flex-col gap-2">
                    <TextField
                      width="auto"
                      height="auto"
                      placeHolder="ex. Com-sci"
                      label="สายการเรียน (GradeProgram):"
                      value={gradeLevel.GradeProgram}
                      borderColor={
                        isEmptyData && gradeLevel.GradeProgram.length == 0
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind
                              ? { ...item, GradeProgram: value }
                              : item
                          )
                        );
                      }}
                    />
                    {isEmptyData && gradeLevel.GradeProgram.length == 0 ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div> */}

                  {gradeLevels.length > 1 ? (
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
              isDisabled={false}
            />
            <PrimaryButton
              handleClick={() => void handleSubmit()}
              title={"ยืนยัน"}
              color={"success"}
              Icon={<CheckIcon />}
              reverseIcon={false}
              isDisabled={false}
            />
          </span>
        </div>
      </div>
    </>
  );
}

export default AddModalForm;
