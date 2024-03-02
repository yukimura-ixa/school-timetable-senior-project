import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
// import { Teacher } from "../model/teacher";
import api from "@/libs/axios";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
type props = {
  closeModal: any;
  openSnackBar: any;
  academicYear: string;
  semester: string;
  mutate: Function;
};

function CloneTimetableDataModal({
  closeModal,
  openSnackBar,
  academicYear,
  semester,
  mutate,
}: props) {
  const [selectedCloneData, setSelectedCloneData] = useState<string>(""); //เก็บปีและเทอมที่จะเอาข้อมูลมา
  const [cloneList, setCloneList] = useState({
    assign : false,
    lock : false,
    timetable : false
  }) //เก็บค่าของที่ติ๊ก checkbox
  //   const confirmed = () => {
  //     removeMultiData();
  //     closeModal();
  //   };
  const cancel = () => {
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  //   const removeMultiData = () => {
  //     try {
  //       const response = api.delete("/timeslot", {
  //         data: { academicYear: academicYear, Semester: "SEMESTER_" + semester },
  //       });
  //       if (response.status === 200) {
  //         openSnackBar("DELETED");
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-fit h-fit p-7 gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">คัดลอกข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={cancel} />
          </div>
          <div className="flex flex-col gap-5 w-[500px] h-auto justify-between items-center border p-3 rounded">
            <div className="flex w-full justify-between items-center">
              <b className="text-sm">ต้องการคัดลอกข้อมูลไปที่</b>
              <p className="text-sm">
                {semester}/{academicYear}
              </p>
            </div>
            <div className="flex flex-col w-full justify-center items-center">
              <div className="flex w-full justify-between items-center">
                <b className="text-sm" onClick={() => console.log(cloneList)}>เลือกข้อมูลที่ต้องการคัดลอก</b>
                <div className="flex gap-3">
                  <Dropdown
                    data={["1/2565", "2/2565", "1/2566", "2/2566", "1/2567"].filter(item => item !== `${semester}/${academicYear}`)}
                    renderItem={({ data }): JSX.Element => (
                      <li className="w-full text-sm">{data}</li>
                    )}
                    currentValue={selectedCloneData}
                    handleChange={(value: string) => {
                      setSelectedCloneData(() => value);
                    }}
                    searchFunciton={undefined}
                  />
                </div>
              </div>
              {selectedCloneData.length !== 0 ? (
              <div className="flex w-full flex-col gap-3">
                <CheckBox
                  label={"การมอบหมายวิชาเรียน"}
                  value={""}
                  name={"Assign"}
                  handleClick={() => setCloneList(() => ({...cloneList, assign : !cloneList.assign}))}
                  checked={false}
                />
                <CheckBox
                  label={"คาบล็อก"}
                  value={""}
                  name={"LockData"}
                  handleClick={() => setCloneList(() => ({...cloneList, lock : !cloneList.lock}))}
                  checked={false}
                />
                <CheckBox
                  label={"ตารางสอน"}
                  value={""}
                  name={"Timeslot"}
                  handleClick={() => setCloneList(() => ({...cloneList, timetable : !cloneList.timetable}))}
                  checked={false}
                />
              </div>
            ) : null}
            </div>
          </div>
          <span className="w-full flex gap-3 justify-end h-11">
            <PrimaryButton
              handleClick={cancel}
              title={"ยกเลิก"}
              color={"danger"}
              Icon={<CloseIcon />}
              reverseIcon={false}
              isDisabled={false}
            />
            <PrimaryButton
              handleClick={undefined}
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
export default CloneTimetableDataModal;
