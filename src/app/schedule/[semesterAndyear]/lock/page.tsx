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
      <div className='flex flex-col gap-3 my-5'>
        <LockSchedule />
      </div>
    </>
  )
}

export default LockSchedulePage;