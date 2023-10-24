import React from 'react'

type Props = {}

function SubjectBox({}: Props) {
  return (
    <>
        <div className='flex flex-col w-full border border-[#EDEEF3] p-4 gap-4 text-center'>
            <p className='text-sm'>ลากกล่องวิชาไปยังคาบที่ต้องการ</p>
            <div className='flex w-full gap-3'>
                <div className='flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none'>
                    <p>ท31201</p>
                    <p>ภาษาไทย</p>
                </div>
                <div className='flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none'>
                    <p>ท31201</p>
                    <p>ภาษาไทย</p>
                </div>
                <div className='flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none'>
                    <p>ท31201</p>
                    <p>ภาษาไทย</p>
                </div>
                <div className='flex flex-col py-2 text-sm w-[70px] h-[60px] rounded border border-[#EDEEF3] cursor-pointer select-none'>
                    <p>ท31201</p>
                    <p>ภาษาไทย</p>
                </div>
            </div>
        </div>
    </>
  )
}

export default SubjectBox