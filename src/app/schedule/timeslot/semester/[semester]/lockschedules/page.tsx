'use client'
import React from 'react'
import { HiLockClosed } from 'react-icons/hi2'
import LockSchedule from './component/LockSchedule';
import { usePathname, useRouter } from 'next/navigation'

type Props = {}

const LockSchedulePage = (props: Props) => {
    const router = useRouter();
    const pathName = usePathname();
  return (
    <>
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button onClick={() => {router.replace(`${pathName.substring(0, 29)}/classify`)}} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จำแนกวิชาเรียน</p>
          </button>
          <button className='flex gap-3 w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <LockSchedule />
      </div>
    </>
  )
}

export default LockSchedulePage