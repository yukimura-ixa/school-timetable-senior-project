import Image from 'next/image';
import React, { useState } from 'react'

//SVG
import bluepencil from '@/svg/bluepencil.svg';
import bluetrash from '@/svg/bluetrash.svg';

interface Table {
    data: any[];
    tableHead: string[];
}
function Table() {
    const tableHead: string[] = ["IDs", "Firstname", "Lastname", "Department"]
    const data: any[] = [
        {
            id: "123124",
            firstName: "Ricardo",
            lastName: "Milos",
            department: "Dance"
        },
        {
            id: "d121",
            firstName: "Billy",
            lastName: "Harrington",
            department: "Trainer"
        },
        {
            id: "degdfd",
            firstName: "Tim",
            lastName: "Carlton",
            department: "Surfskate"
        },
        {
            id: "saokppo",
            firstName: "Danny",
            lastName: "Lee",
            department: "Artist"
        }
    ]
    const [isHover, setIsHover] = useState(false);
    const [hoverPoint, setHoverPoint] = useState(-1);
    return (
        <div className='overflow-x'>
            <table className='table-auto w-full'>
                <thead>
                    <tr className='h-[60px] bg-[#F1F3F9]'>
                        <th className='w-20 px-6'>
                            <input type='checkbox' />
                        </th>
                        {tableHead.map(item => <th className='cursor-pointer text-left px-6'>{item}</th>)}
                    </tr>
                </thead>
                <tbody className='text-sm'>
                    {data.map((item, index) => (
                        <tr className='relative h-[60px] border-b bg-[#FFF] hover:bg-[#EAF2FF] hover:text-[#3B8FEE] cursor-pointer' key={item.id}
                        onMouseEnter={() => {setIsHover(true), setHoverPoint(index)}} onMouseLeave={() => {setIsHover(false), setHoverPoint(-1)}}>
                            <th>
                                <input type='checkbox' value={item.id} name="itemdata" checked={false} />
                            </th>
                            <td className='font-bold px-6 whitespace-nowrap'>{item.id}</td>
                            <td className='px-6 whitespace-nowrap'>{item.firstName}</td>
                            <td className='px-6 whitespace-nowrap'>{item.lastName}</td>
                            <td className='px-6 whitespace-nowrap'>{item.department}</td>
                            {isHover && (hoverPoint === index)
                            ?
                            <div className='flex justify-between w-fit h-full gap-5 absolute right-5 bg-[#EAF2FF]'>
                                <Image src={bluepencil} alt='editicon' />
                                <Image src={bluetrash} alt='deleteicon' />
                            </div>
                            :
                            null
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table
