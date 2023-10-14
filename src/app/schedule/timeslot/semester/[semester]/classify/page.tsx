"use client"
import React, {useState} from 'react'
import ShowTeacherData from './component/ShowTeacherData';
import ClassroomResponsibility from './teacher_responsibility/page';
type Props = {}

function ClassifySubject (props: Props) {
    const [classroomResponsibility, setClassRoomResponsibility] = useState<boolean>(false);
  return (
    <>  
      <div className='flex flex-col gap-3'>
        <div className='flex pt-5 w-full h-fit border-b'>
          <button className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
            <p>จำแนกวิชาเรียน</p>
          </button>
            <button className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
            <p>จัดตารางสอน</p>
          </button>
        </div>
        <ShowTeacherData />
      </div>
        {/* {classroomResponsibility ? <ClassroomResponsibility backPage={() => setClassRoomResponsibility(false)} /> : <ShowTeacherData nextPage={() => setClassRoomResponsibility(true)} />} */}
    </>
  )
}

export default ClassifySubject;