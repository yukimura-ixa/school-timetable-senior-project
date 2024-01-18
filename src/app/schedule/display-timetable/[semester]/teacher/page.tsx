"use client"
import { usePathname, useRouter } from 'next/navigation';
// import { useRouter } from 'next/router'
import React, {useState} from 'react'
import TimeSlot from './component/Timeslot';
import SelectTeacher from './component/SelectTeacher';
type Props = {}

function page({}: Props) {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <>
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button className='flex gap-3 w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>ตารางครู</p>
          </button>
          <button onClick={() => {router.replace(`${pathName.substring(0, 38)}/student`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>ตารางนักเรียน</p>
          </button>
        </div>
        <SelectTeacher />
        <TimeSlot/>
      </div>
    </>
  )
}

export default page