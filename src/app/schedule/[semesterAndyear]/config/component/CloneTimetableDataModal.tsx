import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import api, { fetcher } from "@/libs/axios";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import CheckBox from "@/components/elements/input/selected_input/CheckBox";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import useSWR from "swr";
import { CircularProgress } from "@mui/material";
type props = {
  closeModal: any;
  academicYear: string;
  semester: string;
  mutate: Function;
};

function CloneTimetableDataModal({
  closeModal,
  academicYear,
  semester,
  mutate,
}: props) {
  const [selectedCloneData, setSelectedCloneData] = useState<string>(""); //เก็บปีและเทอมที่จะเอาข้อมูลมา
  const [cloneList, setCloneList] = useState({
    assign: false,
    lock: false,
    timetable: false,
  });
  const [validate, setValidate] = useState(false); //เก็บค่าของการตรวจสอบข้อมูลที่ติ๊ก checkbox

  function validateData() {
    if (Object.values(cloneList).includes(true)) {
      setValidate(true);
    } else {
      setValidate(false);
    }
  }

  useEffect(() => {
    validateData();
    console.log(validate);
  }, [cloneList]);

  const tableConfig = useSWR("/config", fetcher);

  // เก็บค่าของที่ติ๊ก checkbox
  const confirmed = () => {
    if (!validate) {
      enqueueSnackbar("กรุณาเลือกข้อมูลที่ต้องการคัดลอก", {
        variant: "warning",
      });
      return;
    }
    copyData();
    closeModal();
  };
  const cancel = () => {
    closeModal();
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  async function copyData() {
    const copying = enqueueSnackbar("กำลังเรียกข้อมูล", {
      variant: "info",
      persist: true,
    });
    try {
      const response = await api.post("/config/copy", {
        from: selectedCloneData,
        to: semester + "/" + academicYear,
        ...cloneList,
      });
      console.log(response);

      if (response.status === 200) {
        closeSnackbar(copying);
        enqueueSnackbar("เรียกข้อมูลสำเร็จ", { variant: "success" });
        mutate();
      }
    } catch (error) {
      closeSnackbar(copying);
      console.log(error);
      enqueueSnackbar("เกิดข้อผิดพลาดในการเรียกข้อมูล", { variant: "error" });
    }
  }
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
              <b className="text-sm">คัดลอกข้อมูลไปที่เทอม</b>
              <p className="text-sm">
                {semester}/{academicYear}
              </p>
            </div>
            <div className="flex flex-col w-full justify-center items-center">
              <div className="flex w-full justify-between items-center">
                <b className="text-sm" onClick={() => console.log(cloneList)}>
                  เลือกเทอมที่ต้องการคัดลอก
                </b>
                <div className="flex gap-3">
                  {tableConfig.isValidating ? (
                    <CircularProgress />
                  ) : (
                    <Dropdown
                      data={tableConfig.data}
                      renderItem={({ data }): JSX.Element => (
                        <li className="w-full text-sm">{data.ConfigID}</li>
                      )}
                      currentValue={selectedCloneData}
                      handleChange={(value: string) => {
                        setSelectedCloneData(() => value.ConfigID);
                      }}
                      searchFunciton={undefined}
                    />
                  )}
                </div>
              </div>
              {selectedCloneData.length !== 0 ? (
                <div className="flex w-full flex-col gap-3">
                  <CheckBox
                    label={"การมอบหมายวิชาเรียน"}
                    value={""}
                    name={"Assign"}
                    handleClick={() =>
                      setCloneList(() => ({
                        ...cloneList,
                        assign: !cloneList.assign,
                      }))
                    }
                    checked={false}
                  />
                  <CheckBox
                    label={"คาบล็อก"}
                    value={""}
                    name={"LockData"}
                    handleClick={() =>
                      setCloneList(() => ({
                        ...cloneList,
                        lock: !cloneList.lock,
                      }))
                    }
                    disabled={!cloneList.assign}
                  />
                  <CheckBox
                    label={"ตารางสอน"}
                    value={""}
                    name={"Timeslot"}
                    handleClick={() =>
                      setCloneList(() => ({
                        ...cloneList,
                        timetable: !cloneList.timetable,
                      }))
                    }
                    disabled={!cloneList.assign}
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
export default CloneTimetableDataModal;
