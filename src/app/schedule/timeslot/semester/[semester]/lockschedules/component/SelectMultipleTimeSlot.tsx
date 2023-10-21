import React, { Fragment } from 'react'

type Props = {
    timeSlotHandleChange:any;
    checkedCondition:any;
}

function SelectMultipleTimeSlot(props: Props) {
  return (
    <>
        <div className="flex justify-between w-full">
            <div className="text-sm flex gap-1">
            <p>คาบที่</p>
            <p className="text-red-500">*</p>
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
  )
}

export default SelectMultipleTimeSlot