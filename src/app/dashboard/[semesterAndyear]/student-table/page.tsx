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
        <SelectClassRoom />
        <TimeSlot/>
      </div>
    </>
  )
}

export default page