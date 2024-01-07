"use client"
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React from "react";

type Props = {};

function SelectYearAndSemester (props: Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-start items-center border-b py-4">
        <h1 className="text-lg font-bold">เลือกปีการศึกษาและเทอม</h1>
      </div>
      <div className="flex justify-between">
        <p>เลือกปีการศึกษา</p>
        <Dropdown
          data={[2566, 2567, 2568, 2569]}
          renderItem={({ data }): JSX.Element => (
            <li className="w-full text-sm">{data}</li>
          )}
          width={400}
          height={40}
          currentValue={2566}
          placeHolder="เลือกปีการศึกษา"
        />
      </div>
      <div className="flex justify-between">
        <p>เลือกเทอม</p>
        <Dropdown
          data={[1, 2]}
          renderItem={({ data }): JSX.Element => (
            <li className="w-full text-sm">{data}</li>
          )}
          width={400}
          height={40}
          currentValue={1}
          placeHolder="เลือกเทอม"
        />
      </div>
      <div className="flex justify-end items-center">
        <PrimaryButton handleClick={undefined} title={"ยืนยัน"} color={""} Icon={undefined} reverseIcon={false} />
      </div>
    </div>
  );
};
export default SelectYearAndSemester;