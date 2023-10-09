import React, {useState} from 'react'
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md'

type Props = {
    values: string|number[];
}

const SelectedValue = ({values = [2565, 2566, 2567, 2568]}: Props) => {
    const [index, setIndex] = useState<number>(0);
    const [selectedValue, setSelectedValue] = useState<string|number[]>(values);
    const fowardValue = (): void => {
        if (index + 1 === values.length) {
          // console.log("no");
        } else {
          setIndex(() => index + 1);
        }
      };
    const previousValue = (): void => {
        if (index - 1 < 0) {
            // console.log("no");
          } else {
            setIndex(() => index - 1);
          }
      };
    // const keyListener = (e: React.KeyboardEvent<HTMLDivElement>) => {
    //     if (e.key === 'ArrowLeft') {
    //         previousValue();
    //     } else if(e.key === 'ArrowRight') {
    //         fowardValue();
    //     }
    //   };
  return (
    <>
    <div className="relative flex justify-between w-fit h-[45px] border border-[#EDEEF3] items-center gap-5 px-3 select-none">
        <MdArrowBackIosNew className="cursor-pointer" onClick={() => previousValue()} />
        <p className='text-lg text-gray-600'>{selectedValue[index]}</p>
        <MdArrowForwardIos className="cursor-pointer" onClick={() => fowardValue()} />
    </div>
    </>
  )
}
export default SelectedValue;