"use client"
import MiniButton from '@/components/elements/static/MiniButton'
import React, { useState } from 'react'
import { MdAddCircle } from 'react-icons/md'
import { TbSettings } from 'react-icons/tb'
import AddLockSchduleModal from './AddLockSchduleModal'

type Props = {}

const LockSchedule = (props: Props) => {
  const [addLockSchduleModalActive, SetAddLockSchduleModalActive] = useState<boolean>(false);
  return (
    <>
      {addLockSchduleModalActive ? <AddLockSchduleModal closeModal={() => SetAddLockSchduleModalActive(false)} /> : null}
      <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
        {[1].map((item) => (
          <>
            <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-[214px] border border-[#EDEEF3] rounded">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">
                  พุธ คาบที่ 9 ลูกเสือ-ยุวกาชาด
                </p>
                <TbSettings size={24} className="fill-[#EDEEF3]" />
              </div>
              {/* Tooltips */}
              <div
                className={`hidden duration-300 absolute top-[55%] right-[-25px] rounded flex flex-wrap justify-center w-[200px] gap-2 h-fit p-2 drop-shadow-md bg-white`}
              >
                {[
                  201, 202, 301, 302, 303, 304, 305, 306, 303, 304, 305, 306,
                ].map((item) => (
                  <>
                    <p className="text-[#4F515E]">
                      ม.{item.toString().substring(0, 1)}/
                      {item.toString().substring(2)}
                    </p>
                  </>
                ))}
              </div>
              {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ชั้นเรียน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {[
                    201, 202, 301, 302, 303, 304, 305, 306, 303, 304, 305, 306,
                  ].map((item, index) => (
                    <>
                      {index < 9 ? (
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`ม.${item.toString().substring(0, 1)}/${item
                            .toString()
                            .substring(2)}`}
                        />
                      ) : index < 10 ? (
                        <div
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          className="hover:bg-gray-100 duration-300 w-[45px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                        >
                          <p>...</p>
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </div>
              {/* Tooltips */}
              <div
                className={`hidden duration-300 absolute bottom-[-180px] right-[-50px] rounded flex flex-wrap justify-start w-[200px] gap-2 h-fit p-2 drop-shadow-md bg-white`}
              >
                {[
                  "ครูอเนก - คณิตศาสตร์",
                  "ครูอำนวย - ศิลปะ",
                  "ครูชาคริต - การงานอาชีพ",
                  "ครูอเนก - คณิตศาสตร์",
                  "ครูอำนวย - ศิลปะ",
                  "ครูชาคริต - การงานอาชีพ",
                ].map((item) => (
                  <>
                    <p className="text-[#4F515E]">{item}</p>
                  </>
                ))}
              </div>
              {/* ครูที่เลือก */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">ครูผู้สอน</p>
                <div className="flex flex-wrap w-[365px] h-fit gap-2">
                  {[
                    "ครูอเนก - คณิตศาสตร์",
                    "ครูอำนวย - ศิลปะ",
                    "ครูชาคริต - การงานอาชีพ",
                    "ครูอเนก - คณิตศาสตร์",
                    "ครูอำนวย - ศิลปะ",
                    "ครูชาคริต - การงานอาชีพ",
                  ].map((item, index) => (
                    <>
                      {index < 3 ? (
                        <MiniButton
                          // width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={item}
                        />
                      ) : index < 4 ? (
                        <div className="hover:bg-gray-100 duration-300 w-[100px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]">
                          <p>...</p>
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </>
        ))}
        <div onClick={() => SetAddLockSchduleModalActive(true)} className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[214px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300">
          <MdAddCircle size={24} className="fill-gray-500" />
          <p className="text-lg font-bold">เพิ่มคาบล็อก</p>
        </div>
      </div>
    </>
  )
}

export default LockSchedule