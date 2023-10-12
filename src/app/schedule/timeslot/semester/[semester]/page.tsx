"use client"
import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
// import { useRouter } from 'next/router'
import React, {useState} from 'react'
import ClassifySubject from '../../page/ClassifySubject';

type Props = {}

function TimeSlot({}: Props) {
  const [page, setPage] = useState<string>("Classify");
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex pt-5 w-full h-fit border-b'>
        {page === "Classify" 
        ?
        <>
        <button onClick={() => setPage("Classify")} className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
          <p>จำแนกวิชาเรียน</p>
        </button>
          <button onClick={() => setPage("Arrange")} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
          <p>จัดตารางสอน</p>
        </button>
        </>
        : 
        <>
        <button onClick={() => setPage("Classify")} className='flex w-fit h-[60px] items-center px-3 cursor-pointer focus:outline-none'>
          <p>จำแนกวิชาเรียน</p>
        </button>
        <button onClick={() => setPage("Arrange")} className='flex w-fit h-[60px] bg-gray-100 items-center px-3 cursor-pointer focus:outline-none'>
          <p>จัดตารางสอน</p>
        </button>
        </>
        }
      </div>
      {page === "Classify" 
      ?
        <ClassifySubject />
      :
        null
      }
    </div>
  )
}

export default TimeSlot;