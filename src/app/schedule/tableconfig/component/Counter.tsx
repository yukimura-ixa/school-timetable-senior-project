import React, {useState} from 'react'
import { IoMdRemove, IoMdAdd } from 'react-icons/io'
type Props = {
    classifier: string;
    initialValue: number;
}

function Counter({classifier, initialValue=1}: Props) {
    const [count, setCount] = useState<number>(initialValue);
  return (
    <>
    <div className='flex w-[180px] justify-between h-[45px] border border-[#EDEEF3] select-none gap-5 px-3 items-center'>
        <IoMdRemove size={25} className="cursor-pointer" onClick={() => setCount(() => count-1 < 1 ? 1 : count-1)} />
        <p className='text-lg text-gray-600'>{count} {classifier}</p>
        <IoMdAdd size={25} className="cursor-pointer" onClick={() => setCount(() => count+1)} />
    </div>
    </>
  )
}

export default Counter