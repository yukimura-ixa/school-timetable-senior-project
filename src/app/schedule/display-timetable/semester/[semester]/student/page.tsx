"use client"
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import SelectClassRoom from './component/SelectClassroom';
import TimeSlot from './component/Timeslot';

type Props = {}

function page({}: Props) {
    const router = useRouter();
    const pathName = usePathname();
  return (
    <>
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button onClick={() => {router.replace(`${pathName.substring(0, 38)}/teacher`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>ตารางครู</p>
          </button>
          <button className='flex gap-3 w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>ตารางนักเรียน</p>
          </button>
        </div>
        <SelectClassRoom />
        <TimeSlot/>
      </div>
    </>
  )
}

export default page