import React, { useState } from "react";
import TextField from "@/components/elements/input/field/TextField";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import NumberField from "@/components/elements/input/field/NumberField";
import { TbTrash } from "react-icons/tb";
import { BsInfo } from "react-icons/bs";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import api from "@/libs/axios";
import type { gradelevel } from "@prisma/client";
type props = {
  closeModal: any;
  openSnackBar: any;
  mutate: Function;
};
function AddModalForm({ closeModal, openSnackBar, mutate }: props) {
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [gradeLevels, setGradeLevels] = useState<gradelevel[]>([
    {
      GradeID: null,
      Year: 1,
      Number: null,
      ProgramID: 0,
    },
  ]);
  const addList = () => {
    let struct: gradelevel = {
      GradeID: null,
      Year: 1,
      Number: null,
      ProgramID: 0,
    };
    setGradeLevels(() => [...gradeLevels, struct]);
  };
  const removeList = (index: number): void => {
    let copyArray = [...gradeLevels];
    copyArray.splice(index, 1);
    setGradeLevels(() => copyArray);
  };
  const isValidData = (): boolean => {
    let isValid = true;
    gradeLevels.forEach((data) => {
      if (data.GradeID == null || data.Year == null || data.Number == null) {
        setIsEmptyData(true);
        isValid = false;
      }
    });
    return isValid;
  };
  const addData = async (data: gradelevel[]) => {
    console.log(data);
    const response = await api.post("/gradelevel", data);
    console.log(response);
    if (response.status === 200) {
      mutate();
      openSnackBar("ADD");
    }
  };
  const handleSubmit = () => {
    if (isValidData()) {
      addData(gradeLevels);
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
            handleClick={addList}
          />
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            {gradeLevels.map((gradeLevel, index) => (
              <React.Fragment key={`AddData${index + 1}`}>
                <div
                  className={`flex flex-row gap-3 items-center ${
                    index == gradeLevels.length - 1 ? "" : "mt-8"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center mr-5">
                    <p
                      className="text-sm font-bold"
                      onClick={() => console.log(gradeLevels)}
                    >
                      รายการที่
                    </p>
                    <p>{index + 1}</p>
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <NumberField
                      width="auto"
                      height="auto"
                      placeHolder="ex. 101"
                      label="รหัสชั้นเรียน (GradeID):"
                      value={gradeLevel.GradeID}
                      borderColor={
                        isEmptyData &&
                        (gradeLevel.GradeID == 0 || gradeLevel.GradeID == null)
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: number = e.target.value;
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind ? { ...item, GradeID: value } : item
                          )
                        );
                      }}
                    />
                    {isEmptyData &&
                    (gradeLevel.GradeID == 0 || gradeLevel.GradeID == null) ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <label className="text-sm font-bold">
                      มัธยมปีที่ (Year):
                    </label>
                    <Dropdown
                      data={[1, 2, 3, 4, 5, 6]}
                      renderItem={({ data }): JSX.Element => (
                        <li className="w-full">{data}</li>
                      )}
                      width={150}
                      height={40}
                      currentValue={gradeLevel.Year}
                      placeHolder={"ตัวเลือก"}
                      handleChange={(value: number) => {
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind ? { ...item, Year: value } : item
                          )
                        );
                      }}
                    />
                  </div>
                  <div className="relative flex flex-col gap-2">
                    <NumberField
                      width="auto"
                      height="auto"
                      placeHolder="ex. 5"
                      label="ห้องที่ (Number):"
                      value={gradeLevel.Number}
                      borderColor={
                        isEmptyData &&
                        (gradeLevel.Number == 0 || gradeLevel.Number == null)
                          ? "#F96161"
                          : ""
                      }
                      handleChange={(e: any) => {
                        let value: string = e.target.value;
                        setGradeLevels(() =>
                          gradeLevels.map((item, ind) =>
                            index === ind
                              ? { ...item, Number: parseInt(value) || null }
                              : item
                          )
                        );
                      }}
                    />
                    {isEmptyData &&
                    (gradeLevel.Number == 0 || gradeLevel.Number == null) ? (
                      <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                        <BsInfo className="bg-red-500 rounded-full fill-white" />
                        <p className="text-red-500 text-sm">ต้องการ</p>
                      </div>
                    ) : null}
                  </div>
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
              </React.Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end mt-5 gap-3 h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />}
            />
            <PrimaryButton
              handleClick={handleSubmit}
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

export default AddModalForm;
