import React from 'react'

type Props = {
    days: string[]
    slotAmount: number[]
}

const TableHead = (props: Props) => {
  return (
    <thead>
        <tr className='flex items-center gap-2 h-fit select-none'>
            <th className='w-[50px] h-[60px] flex items-center justify-center bg-slate-100 rounded'>
                <p>ลำดับ</p>
            </th>
            <th className='w-[250px] h-[60px] flex items-center justify-center bg-slate-100 rounded'>
                <p>ผู้สอน</p>
            </th>
            {props.days.map(item => (
                <th>
                    <div className='flex flex-col items-center'>
                        <div style={{backgroundColor : item.BgColor}} className='w-full h-[25px] flex items-center justify-center rounded'>
                            <p>{item.Day}</p>
                        </div>
                        <div className='flex gap-2 pt-1 w-fit h-[25px]'>
                            {props.slotAmount.map(item => (
                                <div className='w-10 h-fit bg-slate-100 rounded'>
                                    <p>{item}</p>
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