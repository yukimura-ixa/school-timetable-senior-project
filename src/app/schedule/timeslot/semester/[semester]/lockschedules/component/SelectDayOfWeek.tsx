import Dropdown from '@/components/elements/input/selected_input/Dropdown'
import React from 'react'

type Props = {
    dayOfWeek: any;
    handleDayChange:any;
}

function SelectDayOfWeek (props: Props) {
  return (
    <>
        <div className="flex justify-between w-full items-center">
            <div className="text-sm flex gap-1">
            <p>วัน</p>
            <p className="text-red-500">*</p>
            </div>
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
                <li className="w-full text-sm">{data}</li>
            )}
            width={200}
            height={40}
            currentValue={props.dayOfWeek}
            placeHolder={"ตัวเลือก"}
            handleChange={props.handleDayChange}
            />
        </div>
    </>
  )
}

export default SelectDayOfWeek