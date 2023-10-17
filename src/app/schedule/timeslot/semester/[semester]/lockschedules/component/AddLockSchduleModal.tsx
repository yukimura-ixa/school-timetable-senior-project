import SearchBar from "@/components/elements/input/field/SearchBar";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import MiniButton from "@/components/elements/static/MiniButton";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

type Props = {
  closeModal: any;
};

function AddLockSchduleModal({ closeModal }: Props) {
  return (
    <>
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div
          className={`relative flex flex-col w-[831px] h-fit overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
        >
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-xl select-none">เพิ่มวิชาล็อก</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          <div className="flex flex-col gap-5 p-4 w-full h-[550px] overflow-y-scroll border border-[#EDEEF3]">
            {/* select subject */}
            <div className="flex justify-between w-full items-center">
                <p className="text-sm">วิชา</p>
                <Dropdown
                data={["การคิดเชิงคำนวณ", "ปลูกผักสวนครัว", "ลูกเสิอ", "เนตรนารี", "ยุวกาชาด"]}
                renderItem={({ data }): JSX.Element => (
                    <li className="w-full">{data}</li>
                )}
                width={150}
                height={40}
                currentValue={""}
                placeHolder={"ตัวเลือก"}
                handleChange={(value: string) => {}}
                useSearchBar={true}
                />
            </div>
            {/* select day of week */}
            <div className="flex justify-between w-full items-center">
              <p className="text-sm">วัน</p>
              <Dropdown
                data={[
                  "จันทร์",
                  "อังคาร",
                  "พุธ",
                  "พฤหัสบดี",
                  "ศุกร์",
                  "เสาร์",
                  "อาทิตย์",
                ]}
                renderItem={({ data }): JSX.Element => (
                  <li className="w-full">{data}</li>
                )}
                width={150}
                height={40}
                currentValue={"จันทร์"}
                placeHolder={"ตัวเลือก"}
                handleChange={(value: string) => {}}
              />
            </div>
            {/* select multiple choice of time slot */}
            <div className="flex justify-between w-full">
              <p className="text-sm">คาบที่</p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 w-[230px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                    <React.Fragment key={`slot${item}`}>
                      <CheckBox
                        label={item.toString()}
                        // value={}
                        name={`box${item}`}
                        // handleClick
                        // checked=false
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            {/* select teacher */}
            <div className="flex flex-col gap-5 justify-between w-full">
              <div className="flex justify-between items-center">
                <p className="text-sm">เลือกครู</p>
                <SearchBar width={276} height={45} placeHolder="ค้นหาชื่อคุณครู"/>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                {["ครูอัครเดช - ภาษาไทย", "ครูอเนก - คณิตศาสตร์", "ครูสมชาย - สังคมศึกษา"].map((item) => (
                    <React.Fragment key={`teacher${item}`}>
                        <MiniButton isSelected={true} title={item} border={true} />
                    </React.Fragment>
                ))}
              </div>
            </div>
            {/* select grade for choose classroom */}
            <div className="flex flex-col gap-3 justify-between w-full">
              <p className="text-sm flex gap-2">ชั้นเรียนที่เรียน <p className="text-blue-500">(คลิกที่ห้องเรียนเพื่อเลือก)</p></p>
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <React.Fragment key={`selectGrade${grade}`}>
                  <div className="flex justify-between p-2 w-full h-fit border border-[#EDEEF3] items-center">
                    <p>{`ม.${grade}`}</p>
                    {/* <CheckBox label={`ม.${grade}`} /> */}
                    <div className="flex flex-wrap w-1/2 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((classroom) => (
                            <>
                                <MiniButton border={true} title={`ม.${grade}/${classroom}`} />
                            </>
                        ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <span className="flex w-full justify-end">
            <button className="w-[75px] h-[45px] bg-blue-500 hover:bg-blue-600 duration-300 p-3 rounded text-white text-sm">ยืนยัน</button>
          </span>
        </div>
      </div>
    </>
  );
}

export default AddLockSchduleModal;
