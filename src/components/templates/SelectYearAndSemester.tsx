import React from "react";
import Dropdown from "../elements/input/selected_input/Dropdown";

type Props = {};

const SelectYearAndSemester = (props: Props) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between">
        <p>เลือกปีการศึกษา</p>
        <Dropdown
          data={[2566, 2567, 2568]}
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
    </div>
  );
};
