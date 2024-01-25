"use client"
import React from 'react'
import ShowTeacherData from './component/ShowTeacherData';
type Props = {}

function ClassifySubject (props: Props) {
  return (
    <>
      <div className='flex flex-col gap-3 my-5'>
        <ShowTeacherData />
      </div>
    </>
  )
}

export default ClassifySubject;