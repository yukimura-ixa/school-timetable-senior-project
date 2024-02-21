'use client'
import React from 'react'
import LockSchedule from './component/LockSchedule';

type Props = {}

function LockSchedulePage (props: Props) {
  return (
    <>
      <div className='flex flex-col gap-3 my-5'>
        <LockSchedule />
      </div>
    </>
  )
}

export default LockSchedulePage;