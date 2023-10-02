import Image from 'next/image'
import React from 'react'

import profilepic from '@/svg/profilepic.svg';

function Navbar() {
  return (
    <>
        <nav className='flex w-[1440px] h-full justify-between bg-white px-5 py-3'>
            {/* Leftside */}
            <div className='flex w-fit justify-between items-center gap-20'>
                <h1 className=' text-xl font-bold cursor-pointer'>ระบบจัดตารางเรียนตารางสอน</h1>
                <div className='flex w-fit justify-between gap-10'>
                    <div className='hover:bg-slate-100 p-2 rounded-xl duration-300'>
                        <p className='text-lg cursor-pointer'>เมนูทั้งหมด</p>
                    </div>
                    <div className='hover:bg-slate-100 p-2 rounded-xl duration-300'>
                        <p className='text-lg cursor-pointer'>แดชบอร์ด</p>
                    </div>
                </div>
            </div>
            {/* Rightside */}
            <div className='flex w-fit justify-between gap-6 items-center'>
                {/* Leftside */}
                <div className='flex justify-between gap-3 items-center cursor-pointer'>
                    <Image src={profilepic} alt='profile_pic'/>
                    <div className='flex flex-col'>
                        <p className='font-bold text-md'>อัครเดช</p>
                        <p className='text-md text-slate-400'>คุณครู</p>
                    </div>
                </div>
                {/* Rightside */}
                <p className='underline text-[#3B8FEE] text-md cursor-pointer'>ออกจากระบบ</p>
            </div>
        </nav>
    </>
  )
}

export default Navbar