"use client"
import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import { usePathname } from 'next/navigation'
// import { useRouter } from 'next/router'
import React, {useState} from 'react'
type Props = {}

function TimeSlot({}: Props) {
  const pathName = usePathname();
  const [category, setCategory] = useState<string>("");
  return (
    <>
      <div className='flex w-full h-fit border-b'>
        <div className='flex w-fit h-fit bg-cyan-100'>
          <p>จำแนกวิชาเรียน</p>
        </div>
        <div className='flex w-fit bg-cyan-100'>
          <p>จัดตารางสอน</p>
        </div>
      </div>
      {/* เลือกครู */}
      <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
        <div className="flex items-center gap-4">
          <p className="text-md">เลือกคุณครู</p>
        </div>
        <div className="flex flex-col justify-between gap-3">
          <Dropdown
            data={["ภาษาไทย", "คณิตศาสตร์"]}
            renderItem={
              ({ data }): JSX.Element => (
                <li className="w-[70px]">
                    {data}
                </li>
            )
            }
            width ={300}
            height ={50}
            currentValue={category}
            handleChange={(data:any) => {
              setCategory(data);
            }}
          />
          <Dropdown
            data={["นาย อัครเดช ปัญญาเลิศ", "นาย อเนก ประสงค์"]}
            renderItem={
              ({ data }): JSX.Element => (
                <li className="w-[70px]">
                    {data}
                </li>
            )
            }
            width ={500}
            height ={50}
            currentValue={category}
            handleChange={(data:any) => {
              setCategory(data);
            }}
          />
        </div>
      </div>     
      {/* Teacher name */}
      <div className="flex w-full h-[65px] justify-between p-4 items-center border border-[#EDEEF3]">
        <div className="flex items-center gap-4">
          <p className="text-md">ชื่อ - นามสกุล</p>
        </div>
        <p className="text-md text-gray-500">อัครเดช ปัญญาเลิศ</p>
      </div>
    </>
  )
}

export default TimeSlot;