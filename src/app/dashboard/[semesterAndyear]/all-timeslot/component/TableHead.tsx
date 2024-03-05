import React from 'react'

type Props = {
    days: string[]
    slotAmount: number[]
}

const TableHead = (props: Props) => {
  return (
    <thead>
        <tr className='flex items-center gap-2 h-[60px] select-none'>
            {props.days.map(item => (
                <th>
                    <div className='flex flex-col justify-center items-center'>
                        <div style={{backgroundColor : item.BgColor, color : item.TextColor}} className='w-full h-[25px] flex items-center justify-center rounded'>
                            <p onClick={() => console.log(item)}>{item.Day}</p>
                        </div>
                        <div className='flex gap-2 pt-1 w-fit h-[25px]'>
                            {props.slotAmount.map(item => (
                                <div className='w-14 h-full items-center flex justify-center bg-slate-100 rounded'>
                                    <p className='text-sm'>{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </th>
            ))}
        </tr>
    </thead>
  )
}

export default TableHead