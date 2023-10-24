"use client"
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { HiLockClosed } from 'react-icons/hi2'
import SelectTeacherTimetable from './component/SelectTeacherTimetable';
import TimeSlot from './component/TimeSlot';
import SubjectBox from './component/SubjectBox';

type Props = {}

const ArrangeTimetable = (props: Props) => {
  const pathName = usePathname();
  const router = useRouter()
  return (
    <>
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button onClick={() => {router.replace(`${pathName.substring(0, 29)}/classify`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จำแนกวิชาเรียน</p>
          </button>
          <button onClick={() => {router.replace(`${pathName.substring(0, 29)}/lockschedules`)}} className='flex gap-3 w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <SelectTeacherTimetable />
        <SubjectBox />
        <TimeSlot />
      </div>
    </>
  )
}

export default ArrangeTimetable