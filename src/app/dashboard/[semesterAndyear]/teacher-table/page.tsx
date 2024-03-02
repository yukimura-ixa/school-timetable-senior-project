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
        <SelectTeacher />
        <TimeSlot/>
      </div>
    </>
  )
}

export default page