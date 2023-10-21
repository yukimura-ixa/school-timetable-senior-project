import React, { Fragment } from 'react'

type Props = {}

function TimeSlot(props: Props) {
  return (
    <>
    <div className='flex flex-col gap-3 w-full items-center'>
        {/* top row */}
        <div className='flex gap-4 justify-around items-center'>
            <div className='flex w-auto p-4 h-[53px] rounded border border-[#ABBAC1] items-center justify-center'>
                <p className=''>คาบที่</p>
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                <Fragment key={`woohoo${item}`}>
                    <div className='flex p-4 w-auto h-[53px] rounded border border-[#ABBAC1] items-center justify-center'>
                        <p className=''>{item}</p>
                    </div>
                </Fragment>
            ))}
        </div>
        {/* time row */}
        {/* <div className='flex gap-4 justify-around items-center'>
            <div className='flex p-4 h-[40px] rounded border border-[#ABBAC1] items-center justify-center'>
                <p className=''>เวลา</p>
            </div>
            {["8.30-9.20", "9.20-10.10", "8.30-9.20", "8.30-9.20", "8.30-9.20", "8.30-9.20", "8.30-9.20", "8.30-9.20", "8.30-9.20", "8.30-9.20"].map((item) => (
                <Fragment key={`woohoo${item}`}>
                    <div className='flex h-[40px] rounded border border-[#ABBAC1] items-center justify-center'>
                        <p className='text-xs'>{item}</p>
                    </div>
                </Fragment>
            ))}
        </div> */}
    </div>
    </>
  )
}

export default TimeSlot