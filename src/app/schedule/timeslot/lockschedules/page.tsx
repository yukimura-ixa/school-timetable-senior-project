'use client'
import React from 'react'
import { HiLockClosed } from 'react-icons/hi2'
import LockSchedule from './component/LockSchedule';
import { usePathname, useRouter } from 'next/navigation'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Link from 'next/link';
type Props = {}

function LockSchedulePage (props: Props) {
    const router = useRouter();
    const pathName = usePathname();
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
          <button className='flex gap-3 w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button onClick={() => {router.replace(`${pathName.substring(0, 18)}/arrange`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <LockSchedule />
      </div>
    </>
  )
}

export default LockSchedulePage;