import Link from 'next/link'
import React, { Fragment } from 'react'

type Props = {}

function AllStudyProgram({}: Props) {
  const AllGrade = [1, 2, 3, 4, 5, 6] 
  return (
    <>
        <div className='w-full h-auto flex flex-wrap justify-between'>
            {AllGrade.map((item) => (
                <Fragment key={item}>
                    <Link href={`/management/program/year/${item}`} className='w-[49%] my-3 h-[200px] rounded border bg-white p-4 hover:bg-slate-100 transition-all duration-300 cursor-pointer'>
                        <p className='text-xl font-bold'>ม.{item}</p>
                    </Link>
                </Fragment>
            ))}
        </div>
    </>
  )
}

export default AllStudyProgram