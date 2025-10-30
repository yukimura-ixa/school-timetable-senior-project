import { useRooms } from "@/hooks";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import type { room } from "@/prisma/generated";
import React, { useEffect, useState, type JSX } from "react";

import type { InputChangeHandler } from "@/types/events";

type Props = {
  roomName: string | null;
  handleRoomChange: (value: room) => void;
  required?: boolean;
};

function SelectRoomName(props: Props) {
  const { data } = useRooms();
  const [rooms, setRooms] = useState<room[]>([]);
  const [roomsFilter, setRoomsFilter] = useState<room[]>([]);
  
  useEffect(() => {
    setRooms(() => data);
    setRoomsFilter(() => data);
  }, [data]);
  const searchHandle: InputChangeHandler = (event) => {
    const text = event.target.value;
    searchName(text);
  };
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    const res = roomsFilter.filter((item) => `${item.RoomName}`.match(name));
    setRooms(res);
  };
  return (
    <>
      <div className="flex justify-between w-full items-center">
        <div className="text-sm flex gap-1 items-center">
          <p>สถานที่เรียน</p>
          <p className="text-red-500">*</p>
        </div>
        <Dropdown
          data={rooms}
          renderItem={({ data }: { data: room }): JSX.Element => (
            <li className="w-full text-sm">{data.RoomName}</li>
          )}
          width={300}
          height={40}
          currentValue={props.roomName}
          placeHolder={"ตัวเลือก"}
          handleChange={props.handleRoomChange}
          useSearchBar={true}
          searchFunction={searchHandle}
        />
      </div>
    </>
  );
}

export default SelectRoomName;
