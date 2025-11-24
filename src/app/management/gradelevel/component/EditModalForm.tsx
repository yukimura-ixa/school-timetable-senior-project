import NumberField from "@/components/elements/input/field/NumberField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";

import React, { useState, type JSX } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsInfo } from "react-icons/bs";
import PrimaryButton from "@/components/mui/PrimaryButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { updateGradeLevelAction } from "@/features/gradelevel/application/actions/gradelevel.actions";
import type { gradelevel } from "@/prisma/generated/client";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type props = {
  closeModal: any;
  data: any;
  clearCheckList: any;
  mutate: Function;
};

function EditModalForm({ closeModal, data, clearCheckList, mutate }: props) {
  const [editData, setEditData] = useState<gradelevel[]>(
    Object.assign([], data),
  );
  const [isEmptyData, setIsEmptyData] = useState(false);
  const isValidData = (): boolean => {
    let isValid = true;
    editData.forEach((data) => {
      if (
        data.Year == null ||
        data.Number == null ||
        data.Number == 0 ||
        data.Year == 0 ||
        data.Year < 1 ||
        data.Year > 6
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
  const editMultiData = async (data: any) => {
    const loadbar = enqueueSnackbar("กำลังแก้ไขข้อมูลชั้นเรียน", {
      variant: "info",
      persist: true,
    });

    try {
      const result = await updateGradeLevelAction({ gradeLevels: data });

      if (!result.success) {
        const errorMessage =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || "Unknown error";
        throw new Error(errorMessage);
      }

      closeSnackbar(loadbar);
      enqueueSnackbar("แก้ไขข้อมูลชั้นเรียนสำเร็จ", { variant: "success" });
      mutate();
    } catch (error: any) {
      closeSnackbar(loadbar);
      enqueueSnackbar(
        "แก้ไขข้อมูลชั้นเรียนไม่สำเร็จ " + (error.message || "Unknown error"),
        {
          variant: "error",
        },
      );
      console.error(error);
    }

    //clear checkbox
    clearCheckList();
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
                  index == 0 ? "" : "mt-2"
                }`}
              >
                <div className="flex flex-col items-center justify-center mr-5">
                  <p className="text-sm font-bold">รายการที่</p>
                  <p>{index + 1}</p>
                </div>
                {/* <div className="relative flex flex-col gap-2">
                  <NumberField disabled={false}
                    width="auto"
                    height="auto"
                    label={`รหัสชั้นเรียน (GradeID):`}
                    placeHolder="ex. 101"
                    value={item.GradeID}
                    borderColor={
                      isEmptyData && (item.GradeID == 0 || item.GradeID == null)
                        ? "#F96161"
                        : ""
                    }
                    disabled={false} handleChange={(e: any) => {
                      let value: number = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, GradeID: value } : item
                        )
                      );
                    }}
                  />
                  {isEmptyData &&
                  (item.GradeID == 0 || item.GradeID == null) ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div> */}
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
                    currentValue={item.Year}
                    placeHolder={"ตัวเลือก"}
                    handleChange={(value: unknown) => {
                      const year = value as number;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind ? { ...item, Year: year } : item,
                        ),
                      );
                    }}
                  />
                </div>
                <div className="relative flex flex-col gap-2">
                  <NumberField
                    width="auto"
                    height="auto"
                    label={`ห้องที่ (Number):`}
                    placeHolder="ex. 1"
                    value={item.Number}
                    borderColor={
                      isEmptyData && (item.Number == 0 || item.Number == null)
                        ? "#F96161"
                        : ""
                    }
                    disabled={false}
                    handleChange={(e: any) => {
                      const value: string = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind
                            ? { ...item, Number: parseInt(value) }
                            : item,
                        ),
                      );
                    }}
                  />
                  {isEmptyData && (item.Number == 0 || item.Number == null) ? (
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
                    label={`สายการเรียน (GradeProgram):`}
                    placeHolder="ex. Com-sci"
                    value={item.GradeProgram}
                    borderColor={
                      isEmptyData && item.GradeProgram.length == 0
                        ? "#F96161"
                        : ""
                    }
                    disabled={false} handleChange={(e: any) => {
                      let value: string = e.target.value;
                      setEditData(() =>
                        editData.map((item, ind) =>
                          index === ind
                            ? { ...item, GradeProgram: value }
                            : item
                        )
                      );
                    }}
                  />
                  {isEmptyData && item.GradeProgram.length == 0 ? (
                    <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
                      <BsInfo className="bg-red-500 rounded-full fill-white" />
                      <p className="text-red-500 text-sm">ต้องการ</p>
                    </div>
                  ) : null}
                </div> */}
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
              isDisabled={false}
            />
            <PrimaryButton
              handleClick={confirmed}
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
export default EditModalForm;
