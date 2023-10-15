"use client"
import React, {useState} from 'react'
import ShowTeacherData from './component/ShowTeacherData';
import ClassroomResponsibility from './teacher_responsibility/page';
import { HiLockClosed } from 'react-icons/hi2';
import { usePathname, useRouter } from 'next/navigation';
type Props = {}

function ClassifySubject (props: Props) {
    const pathName = usePathname();
    const router = useRouter()
    const [classroomResponsibility, setClassRoomResponsibility] = useState<boolean>(false);
  return (
    <>  
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>จำแนกวิชาเรียน</p>
          </button>
          <button onClick={() => {router.replace(`${pathName.substring(0, 29)}/lockschedule`)}} className='flex gap-3 w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <HiLockClosed className="fill-gray-700" />
            <p>ล็อกคาบสอน</p>
          </button>
          <button className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <ShowTeacherData />
      </div>
    </>
  )
}

export default ClassifySubject;