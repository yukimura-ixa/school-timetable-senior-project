import React from 'react'

//SVG
import searchicon from '@/svg/crud/searchicon.svg';

import Image from 'next/image';

interface SearchBar {
    width: string | number;
    height: string | number;
    placeHolder: string; //TEXT
    fill: string; //HEX
    handleChange: Function; //ส่งฟังก์ชั่นจับ event ของ input เสยๆ ส่วนข้างในฟังก์ชั่นอาจจะใส่ Logic Search ลงไป จุ๊บมัวฟ์
}
function SearchBar({ width = null, height, placeHolder = "ค้นหา", fill = "#EDEEF3", handleChange }) {
    return (
        <div className='flex items-center rounded relative'>
            <input type='text' className='text-field pl-[45px]' placeholder={placeHolder}
                   style={{ width: width == null ? 'fit-content' : width, height: height, backgroundColor: fill }}
                   onChange={handleChange}
            />
            <div className='flex gap-3 absolute left-3'>
                <Image src={searchicon} alt='searchicon' />
            </div>
        </div>
    )
}

export default SearchBar
