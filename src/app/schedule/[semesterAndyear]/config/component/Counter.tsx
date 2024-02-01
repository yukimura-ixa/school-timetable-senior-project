import React, {useState} from 'react'
import { IoMdRemove, IoMdAdd } from 'react-icons/io'
type Props = {
    classifier: string;
    currentValue: number;
    onChange: Function;
}

function Counter({classifier, currentValue=1, onChange}: Props) {
  return (
    <>
    <div className='flex w-fit justify-between h-[45px] select-none gap-5 px-3 items-center'>
        <div onClick={() => onChange(currentValue - 1)} className='p-2 drop-shadow w-fit bg-white rounded cursor-pointer hover:bg-slate-100 duration-300'>
          <IoMdRemove size={20} className="cursor-pointer" />
        </div>
        <p className='text-md text-gray-600'>{currentValue} {classifier}</p>
        <div onClick={() => onChange(currentValue + 1)} className='p-2 drop-shadow w-fit bg-white rounded cursor-pointer hover:bg-slate-100 duration-300'>
          <IoMdAdd size={20} className="cursor-pointer"/>
        </div>
    </div>
    </>
  )
}

export default Counter