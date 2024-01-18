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
      <div className='flex flex-col gap-3 my-5'>
        <SelectTeacherTimetable />
        {/* <SubjectBox /> */}
        <TimeSlot />
      </div>
    </>
  )
}

export default ArrangeTimetable