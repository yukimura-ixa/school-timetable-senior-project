import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import axios from "axios";
import React, { useEffect, useState } from "react";

type Props = {};

function SelectTeacherTimetable(props: Props) {
  const [teachers, setTeachers] = useState([]);
  const [teachersFilter, setTeachersFilter] = useState([]);
  const [teacherCurrentValue, setTeacherCurrentValue] = useState("");
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/teacher")
        .then((res) => {
          let data: teacher[] = res.data;
          setTeachers(() => [...data]);
          setTeachersFilter(() => [...data]);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    return () => getData();
  }, []);
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = teachersFilter.filter((item) =>
      `${item.Firstname} ${item.Lastname} - ${item.Department}`.match(name)
    );
    setTeachers(res);
  };
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  return (
    <>
      <div className="flex flex-col w-full p-3 gap-3 h-fit border border-[#EDEEF3]">
        {/* Select Teacher */}
        <div className="flex justify-between items-center">
          <p>เลือกครู</p>
          <Dropdown
            data={teachers}
            width={400}
            renderItem={({ data }): JSX.Element => (
              <li className="w-full text-sm">
                {data.Firstname} {data.Lastname} - {data.Department}
              </li>
            )}
            placeHolder={"ตัวเลือก"}
            currentValue={teacherCurrentValue}
            handleChange={(data: any) => {
              setTeacherCurrentValue(
                `${data.Firstname} ${data.Lastname} - ${data.Department}`
              );
            }}
            useSearchBar={true}
            searchFunciton={searchHandle}
          />
        </div>
        {/* Select Classroom */}
        <div className="flex justify-between items-center">
          <p>เลือกชั้นเรียน</p>
          <Dropdown
            data={teachers}
            width={200}
            renderItem={({ data }): JSX.Element => (
              <li className="w-full text-sm">
                {data.SubjectCode} {data.SubjectName}
              </li>
            )}
            placeHolder={"ตัวเลือก"}
            currentValue={""}
            handleChange={(data: any) => {
            //   setTeacherCurrentValue(
            //     `${data.Firstname} ${data.Lastname} - ${data.Department}`
            //   );
            }}
            useSearchBar={true}
            // searchFunciton={searchHandle}
          />
        </div>
      </div>
    </>
  );
}

export default SelectTeacherTimetable;
