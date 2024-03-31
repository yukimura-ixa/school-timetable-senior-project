import { useRoomData } from "@/app/_hooks/roomData";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { room } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { BsInfo } from "react-icons/bs";

type Props = {
  roomName: any;
  handleRoomChange: any;
  // required: boolean;
};

function SelectRoomName(props: Props) {
  const { data, isLoading, error, mutate } = useRoomData();
  const [rooms, setRooms] = useState<room[]>([]);
  const [roomsFilter, setRoomsFilter] = useState<room[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    if (!isLoading) {
      setRooms(() => data);
      setRoomsFilter(() => data);
    }
  }, [isLoading]);
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = roomsFilter.filter((item) => `${item.RoomName}`.match(name));
    setRooms(res);
  };
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
          data={rooms}
          renderItem={({ data }): JSX.Element => (
            <li className="w-full text-sm">{data.RoomName}</li>
          )}
          width={300}
          height={40}
          currentValue={props.roomName}
          placeHolder={"ตัวเลือก"}
          handleChange={props.handleRoomChange}
          useSearchBar={true}
          searchFunciton={searchHandle}
        />
      </div>
    </>
  );
}

export default SelectRoomName;
