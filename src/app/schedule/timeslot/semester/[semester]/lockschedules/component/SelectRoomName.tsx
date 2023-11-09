import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import React from 'react'
import { BsInfo } from 'react-icons/bs';

type Props = {
    roomName: any;
    handleRoomChange: any;
    required: boolean
}

function SelectRoomName(props: Props) {
  return (
    <>
      <div className="flex justify-between w-full items-center">
        <div className="text-sm flex gap-1 items-center">
          <p>สถานที่เรียน</p>
          <p className="text-red-500">*</p>
          {props.required ? (
          <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
            <BsInfo className="bg-red-500 rounded-full fill-white" />
            <p className="text-red-500 text-sm">ต้องการ</p>
          </div>
          ) : null}
        </div>
        <Dropdown
          data={[
            125,
            222,
            323,
            442,
            352
          ]}
          renderItem={({ data }): JSX.Element => (
            <li className="w-full text-sm">{data}</li>
          )}
          width={200}
          height={40}
          currentValue={props.roomName}
          placeHolder={"ตัวเลือก"}
          handleChange={props.handleRoomChange}
        />
      </div>
    </>
  )
}

export default SelectRoomName