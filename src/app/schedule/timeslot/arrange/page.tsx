"use client"
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { HiLockClosed } from 'react-icons/hi2'
import SelectTeacherTimetable from './component/SelectTeacherTimetable';
import TimeSlot from './component/TimeSlot';
import SubjectBox from './component/SubjectBox';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Link from 'next/link';
type Props = {}

const ArrangeTimetable = (props: Props) => {
  const pathName = usePathname();
  const router = useRouter()
  return (
    <>
      <div className='w-full flex justify-between items-center py-6'>
        <h1 className='text-xl font-bold'>ตารางสอน เทอม 1 ปีการศึกษา 2566</h1>
        <Link className='flex gap-3 items-center justify-between cursor-pointer' href={'/select-semester'}>
          <KeyboardBackspaceIcon className='fill-gray-500' />
          <p className='select-none text-gray-500 text-sm'>เปลี่ยนเทอม</p>
        </Link>
      </div>  
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button onClick={() => {router.replace(`${pathName.substring(0, 18)}/classify`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จำแนกวิชาเรียน</p>
          </button>
          <button onClick={() => {router.replace(`${pathName.substring(0, 18)}/lockschedules`)}} className='flex gap-3 w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <SelectTeacherTimetable />
        {/* <SubjectBox /> */}
        <TimeSlot />
      </div>
    </>
  )
}

export default ArrangeTimetable