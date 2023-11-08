"use client";
import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
type Props = {};

function RoomIndividualDashboard({}: Props) {
  const [classRooms, setClassRooms] = useState([]);
  const [classRoomsFilter, setClassRoomsFilter] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [classRoomData, setClassRoomData] = useState({
    RoomName: 323,
    Subjects: [
      {
        SubjectCode: "ค21101",
        SubjectName: "คณิตศาสตร์พื้นฐาน",
        Teacher: {
          Firstname: "อเนกประสงค์",
        },
        Days: {
          Monday: 3,
          Tuesday: 4,
          Wednesday: 2,
          Thursday: 1,
          Friday: 5,
        },
      },
      {
        SubjectCode: "ค31202",
        SubjectName: "คณิตศาสตร์พื้นฐาน",
        Teacher: {
          Firstname: "สุภาภรณ์",
        },
        Days: {
          Monday: 0,
          Tuesday: 2,
          Wednesday: 6,
          Thursday: 3,
          Friday: 5,
        },
      },
    ],
  });
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = classRoomsFilter.filter((item) =>
      `${item.SubjectCode} ${item.SubjectName}`.match(name)
    );
    setClassRooms(res);
  };
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/classroom_of_allclass")
        .then((res) => {
          let data = res.data;
          setClassRooms(() => data);
          setClassRoomsFilter(() => data);
        })
        .catch((err) => console.log(err));
    };
    return () => getData();
  }, []);
  const handleChange = (value: teacher) => {
    console.log(value);
    setClassRoomData(() => ({ ...classRoomData, Teacher: value }));
  };
  return (
    <>
      <div className="flex flex-col">
        <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
          <h1 className="text-lg">สรุปข้อมูลแต่ละสถานที่เรียน</h1>
        </div>
        <div className="flex justify-between items-center border border-[#EDEEF3] p-4">
          <p>เลือกชั้นเรียน</p>
          {/* <Dropdown
            data={classRooms}
            width={400}
            height={45}
            renderItem={({ data }): JSX.Element => (
              <li className="w-full text-sm">{data}</li>
            )}
            placeHolder="ตัวเลือก"
            currentValue={""}
            // handleChange={handleChange}
            useSearchBar={true}
            // searchFunciton={searchHandle}
          /> */}
        </div>
        <table className="flex flex-col mt-3 gap-3">
          <thead>
            <tr className="flex gap-3">
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[125px] h-[24px] justify-center">
                  <p className="text-black">วิชา</p>
                </span>
              </th>
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[102px] h-[24px] justify-center">
                  <p className="text-black">ครู</p>
                </span>
              </th>
              {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map((item) => (
                <Fragment key={`day${item}`}>
                  <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p className="text-black">{item}</p>
                    </span>
                  </th>
                </Fragment>
              ))}
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-black">รวม</p>
                </span>
              </th>
            </tr>
          </thead>
          <tbody className={`flex flex-col gap-3 h-96 overflow-y-scroll`}>
            {classRoomData.Subjects.map((subj) => (
              <Fragment key={`year${subj.SubjectCode}eiei`}>
                <tr className="flex gap-3">
                  <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                    <span className="flex flex-col w-[122px] h-[60px] justify-center">
                      <p className="text-gray-600 font-bold">
                        {subj.SubjectCode}
                      </p>
                      <p className="text-gray-600">{subj.SubjectName}</p>
                    </span>
                  </td>
                  <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                    <span className="flex w-[100px] h-[24px] justify-center">
                      <p className="text-gray-600">{subj.Teacher.Firstname}</p>
                    </span>
                  </td>
                  <td
                    className={`flex grow justify-center items-center ${
                      subj.Days.Monday == 0 ? "bg-gray-100" : "bg-blue-100"
                    } p-4 rounded select-none`}
                  >
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p
                        className={`${
                          subj.Days.Monday == 0 ? "" : "text-blue-600"
                        }`}
                      >
                        {subj.Days.Monday == 0 ? "" : subj.Days.Monday}
                      </p>
                    </span>
                  </td>
                  <td
                    className={`flex grow justify-center items-center ${
                      subj.Days.Tuesday == 0 ? "bg-gray-100" : "bg-blue-100"
                    } p-4 rounded select-none`}
                  >
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p
                        className={`${
                          subj.Days.Tuesday == 0 ? "" : "text-blue-600"
                        }`}
                      >
                        {subj.Days.Tuesday == 0 ? "" : subj.Days.Tuesday}
                      </p>
                    </span>
                  </td>
                  <td
                    className={`flex grow justify-center items-center ${
                      subj.Days.Wednesday == 0 ? "bg-gray-100" : "bg-blue-100"
                    } p-4 rounded select-none`}
                  >
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p
                        className={`${
                          subj.Days.Wednesday == 0 ? "" : "text-blue-600"
                        }`}
                      >
                        {subj.Days.Wednesday == 0 ? "" : subj.Days.Wednesday}
                      </p>
                    </span>
                  </td>
                  <td
                    className={`flex grow justify-center items-center ${
                      subj.Days.Thursday == 0 ? "bg-gray-100" : "bg-blue-100"
                    } p-4 rounded select-none`}
                  >
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p
                        className={`${
                          subj.Days.Thursday == 0 ? "" : "text-blue-600"
                        }`}
                      >
                        {subj.Days.Thursday == 0 ? "" : subj.Days.Thursday}
                      </p>
                    </span>
                  </td>
                  <td
                    className={`flex grow justify-center items-center ${
                      subj.Days.Friday == 0 ? "bg-gray-100" : "bg-blue-100"
                    } p-4 rounded select-none`}
                  >
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p
                        className={`${
                          subj.Days.Friday == 0 ? "" : "text-blue-600"
                        }`}
                      >
                        {subj.Days.Friday == 0 ? "" : subj.Days.Friday}
                      </p>
                    </span>
                  </td>
                  <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p className="text-gray-600">1</p>
                    </span>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="flex gap-3">
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[275px] h-[24px] justify-center">
                  <p className="text-gray-600">รวม</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">1</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">2</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">3</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">4</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">5</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">6</p>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default RoomIndividualDashboard;
