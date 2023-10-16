import React, { useState } from "react";
import TextField from "@/components/elements/input/field/TextField";
import { AiOutlineClose } from "react-icons/ai";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import NumberField from "@/components/elements/input/field/NumberField";
type props = {
  closeModal: any;
  addData: any;
};
function AddModalForm({ closeModal, addData }: props) {
  const [gradeLevels, setGradeLevels] = useState<gradeLevel[]>([
    {
      GradeID: null,
      Year: 1,
      Number: null,
      GradeProgram: "",
    },
  ]);
  const addList = () => {
    let struct: gradeLevel = {
      GradeID: null,
      Year: 1,
      Number: null,
      GradeProgram: "",
    };
    setGradeLevels(() => [...gradeLevels, struct]);
  };
  const handleSubmit = () => {
    addData(gradeLevels);
    closeModal();
  };
  const cancel = () => {
    closeModal()
  }
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
          <div className="flex flex-col-reverse gap-3">
            {gradeLevels.map((gradeLevel, index) => (
              <React.Fragment key={`AddData${index + 1}`}>
                <div className="flex flex-row gap-3">
                  <div className="flex flex-col items-center justify-center mr-5">
                    <p className="text-sm font-bold">รายการที่</p>
                    <p>{index + 1}</p>
                  </div>
                  <NumberField
                    width="auto"
                    height="auto"
                    placeHolder="ex. 101"
                    label="รหัสชั้นเรียน (GradeID):"
                    value={gradeLevel.GradeID}
                    handleChange={(e: any) => {
                      let value: number = e.target.value;
                      setGradeLevels(() =>
                        gradeLevels.map((item, ind) =>
                          index === ind ? { ...item, GradeID: value } : item
                        )
                      );
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold">
                      มัธยมปีที่ (Year):
                    </label>
                    <Dropdown
                      data={[
                        1,2,3,4,5,6
                      ]}
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
                            index === ind
                              ? { ...item, Year: value }
                              : item
                          )
                        );
                      }}
                    />
                  </div>
                  <NumberField
                    width="auto"
                    height="auto"
                    placeHolder="ex. 5"
                    label="ห้องที่ (Number):"
                    value={gradeLevel.Number}
                    handleChange={(e: any) => {
                      let value: number = e.target.value;
                      setGradeLevels(() =>
                        gradeLevels.map((item, ind) =>
                          index === ind ? { ...item, Number: value } : item
                        )
                      );
                    }}
                  />
                  <TextField
                    width="auto"
                    height="auto"
                    placeHolder="ex. Com-sci"
                    label="สายการเรียน (GradeProgram):"
                    value={gradeLevel.GradeProgram}
                    handleChange={(e: any) => {
                      let value: string = e.target.value;
                      setGradeLevels(() =>
                        gradeLevels.map((item, ind) =>
                          index === ind ? { ...item, GradeProgram: value } : item
                        )
                      );
                    }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end mt-5 gap-3">
            <button
              className=" w-[100px] bg-red-500 hover:bg-red-600 duration-500 text-white py-2 px-4 rounded"
              onClick={() => cancel()}
            >
              ยกเลิก
            </button>
            <button
              className=" w-[100px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded"
              onClick={handleSubmit}
            >
              ยืนยัน
            </button>
          </span>
        </div>
      </div>
    </>
  );
}

export default AddModalForm;
