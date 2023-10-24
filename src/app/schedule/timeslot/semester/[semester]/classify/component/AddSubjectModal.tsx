import NumberField from "@/components/elements/input/field/NumberField";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { TbTrash, TbTrashFilled } from "react-icons/tb";
type Props = {
  closeModal: any;
  addSubjectToClass: any;
  classRoomData: any;
  currentSubject:any
};

function AddSubjectModal (props: Props) {
  const [subject, setSubject] = useState<subject[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<subject[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [subjectList, setSubjectList] = useState(props.currentSubject || []); //เก็บวิชาที่เพิ่มใหม่
  const addSubjectToList = (item: any) => {
    setSubjectList(() => [...subjectList, item]);
  };
  const removeFromSubjectList = (index:number) => {
    setSubjectList(() => subjectList.filter((item, ind) => ind != index))
  };
  useEffect(() => {
    const getSubject = () => {
      axios.get('http://localhost:3000/api/subject')
      .then((res) => {
        let data:subject[] = res.data;
        setSubject(() => data);
        setSubjectFilter(() => data);
      })
      .catch((err) => console.log(err))
    }
    return () => getSubject();
  },[])
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = subjectFilter.filter((item) =>
    `${item.SubjectCode} - ${item.SubjectName}`.match(name)
    );
    setSubject(res);
  };
  const searchHandle = (event:any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  }
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
              เลือกวิชาเรียนที่ต้องสอนในห้อง ม.{props.classRoomData.Year}/{props.classRoomData.GradeID.toString()[2]}
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
                    SubjectID: null,
                    SubjectCode: "",
                    SubjectName: "",
                    Credit: null,
                    Category: "",
                    SubjectProgram: "",
                    TeachHour: 1
                  }
                )
              }
            >
              เพิ่มวิชา
            </u>
          </div>
          <div className="flex flex-col gap-3">
            {subjectList.map((item, index) => (
              <React.Fragment key={`${item.subjectCode} ${index}`}>
                {/* List วิชาต่างๆ */}
                <div className="flex justify-between items-center">
                  <Dropdown
                    data={subject}
                    renderItem={({ data }): JSX.Element => (
                      <li className="text-sm">
                        {data.SubjectCode} - {data.SubjectName}
                      </li>
                    )}
                    width={200}
                    height={"fit-content"}
                    currentValue={`${
                      item.SubjectCode === ""
                        ? ""
                        : `${item.SubjectCode} - ${item.SubjectName}`
                    }`}
                    placeHolder="เลือกวิชา"
                    handleChange={(item: any) => {
                      let data = {
                        ...item,
                        SubjectCode: item.SubjectCode,
                        SubjectName: item.SubjectName,
                        TeachHour: subjectList[index].TeachHour,
                      };
                      setSubjectList(() =>
                        subjectList.map((item, ind) =>
                          ind === index ? data : item
                        )
                      );
                    }}
                    useSearchBar={true}
                    searchFunciton={searchHandle}
                  />
                  <div className="flex justify-between gap-5 items-center">
                    <div className="flex gap-2 items-center">
                      <p className="text-sm text-gray-500">จำนวน</p>
                      <NumberField
                        width={40}
                        height={35}
                        value={item.TeachHour}
                        handleChange={(e:any) => {
                            let data = {
                                ...subjectList[index],
                                TeachHour: parseInt(e.target.value),
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
              <button onClick={() => props.addSubjectToClass(subjectList)} className=" w-[100px] bg-green-500 hover:bg-green-600 duration-500 text-white py-2 px-4 rounded">
                ยืนยัน
              </button>
          </span>
        </div>
      </div>
    </>
  );
};

export default AddSubjectModal;
