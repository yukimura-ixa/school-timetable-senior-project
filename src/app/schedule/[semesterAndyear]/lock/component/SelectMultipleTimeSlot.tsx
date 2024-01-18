import React, { Fragment } from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  timeSlotHandleChange: any;
  checkedCondition: any;
  required:boolean;
};

function SelectMultipleTimeSlot(props: Props) {
  return (
    <>
      <div className="flex justify-between w-full">
        <div className="text-sm flex gap-1 items-center">
          <p>คาบที่</p>
          <p className="text-red-500">*</p>
          {props.required ? (
          <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
            <BsInfo className="bg-red-500 rounded-full fill-white" />
            <p className="text-red-500 text-sm">ต้องการ</p>
          </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 w-[230px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <Fragment key={`slot${item}`}>
                <input
                  type="checkbox"
                  value={item}
                  name={`checkboxTimeSlot`}
                  onChange={props.timeSlotHandleChange}
                  checked={props.checkedCondition.includes(item)}
                />
                <label>{item}</label>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectMultipleTimeSlot;
