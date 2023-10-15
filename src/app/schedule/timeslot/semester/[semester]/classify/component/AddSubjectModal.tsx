import NumberField from "@/components/elements/input/field/NumberField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { TbTrash, TbTrashFilled } from "react-icons/tb";
type Props = {
  closeModal: any;
};

const AddSubjectModal = (props: Props) => {
  const [subjectList, setSubjectList] = useState([]);
  const addSubjectToList = (item: any) => {
    setSubjectList(() => [...subjectList, item]);
  };
  const removeFromSubjectList = (index:number) => {
    setSubjectList(() => subjectList.filter((item, ind) => ind != index))
  };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[550px] h-auto p-[50px] gap-8 bg-white rounded">
          {/* Content */}
          <div className="flex flex-col w-full gap-3 h-auto">
            <div className="flex justify-between">
              <p
                className="text-lg select-none"
                onClick={() => console.log(subjectList)}
              >
                เลือกวิชาที่รับผิดชอบ
              </p>
              <AiOutlineClose
                className="cursor-pointer"
                onClick={props.closeModal}
              />
            </div>
            <p className="text-xs text-gray-300">
              เลือกวิชาเรียนที่ต้องสอนในห้อง ม.2/1
            </p>
          </div>
          {/* กดเพื้อเพิ่มวิชา */}
          <div className="flex flex-col gap-3">
            <u
              className="text-sm text-blue-500 cursor-pointer"
              onClick={() =>
                addSubjectToList(
                  //Add default value to array
                  {
                    subjectID: "",
                    subjectName: "",
                    timeSlotAmount: 1,
                  }
                )
              }
            >
              เพิ่มวิชา
            </u>
          </div>
          <div className="flex flex-col-reverse gap-3">
            {subjectList.map((item, index) => (
              <React.Fragment key={`${item.subjectID} ${index}`}>
                {/* List วิชาต่างๆ */}
                <div className="flex justify-between items-center">
                  <Dropdown
                    data={[
                      {
                        subjectID: "ค33101",
                        subjectName: "คณิตศาสตร์พิ้นฐาน",
                      },
                      {
                        subjectID: "ศ33102",
                        subjectName: "ศิลปะ",
                      },
                      {
                        subjectID: "ว30221",
                        subjectName: "เคมี 1",
                      },
                      {
                        subjectID: "ส22106",
                        subjectName: "ประวัติศาสตร์ 3",
                      },
                    ]}
                    renderItem={({ data }): JSX.Element => (
                      <li className="text-sm">
                        {data.subjectID} - {data.subjectName}
                      </li>
                    )}
                    width={200}
                    height={"fit-content"}
                    currentValue={`${
                      item.subjectID === ""
                        ? ""
                        : `${item.subjectID} - ${item.subjectName}`
                    }`}
                    placeHolder="เลือกวิชา"
                    handleChange={(item: any) => {
                      let data = {
                        subjectID: item.subjectID,
                        subjectName: item.subjectName,
                        timeSlotAmount: subjectList[index].timeSlotAmount,
                      };
                      setSubjectList(() =>
                        subjectList.map((item, ind) =>
                          ind === index ? data : item
                        )
                      );
                    }}
                    useSearchBar={true}
                    // searchFunciton
                  />
                  <div className="flex justify-between gap-5 items-center">
                    <div className="flex gap-2 items-center">
                      <p className="text-sm text-gray-500">จำนวน</p>
                      <NumberField
                        width={40}
                        height={35}
                        value={item.timeSlotAmount}
                        handleChange={(e:any) => {
                            let data = {
                                subjectID: subjectList[index].subjectID,
                                subjectName: subjectList[index].subjectName,
                                timeSlotAmount: parseInt(e.target.value),
                              };
                              setSubjectList(() =>
                                subjectList.map((item, ind) =>
                                  ind === index ? data : item
                                )
                              );
                        }}
                        disabled={item.subjectID === "" ? true : false}
                      />
                      <p className="text-sm text-gray-500">คาบ</p>
                    </div>
                    <TbTrash
                      onClick={() => removeFromSubjectList(index)}
                      size={20}
                      className="text-red-500 cursor-pointer"
                    />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <span className="w-full flex justify-end">
              {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
              <button className=" w-[100px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded">
                ยืนยัน
              </button>
          </span>
        </div>
      </div>
    </>
  );
};

export default AddSubjectModal;
