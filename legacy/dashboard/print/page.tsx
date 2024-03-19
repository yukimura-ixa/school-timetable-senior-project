"use client";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import React, { useRef } from "react";
import ReactToPrint, { useReactToPrint } from "react-to-print";

type Props = {};

const PrintTable = (props: Props) => {
  const ref = useRef<HTMLDivElement>();
  const generatePDF = useReactToPrint({
    content : () => ref.current,
    documentTitle : "MyTable",
    onAfterPrint : () => alert("เรียบร้อย")
  })
  return (
    <>
        <PrimaryButton
        handleClick={generatePDF}
        title={"Print"}
        color={""}
        Icon={undefined}
        reverseIcon={false}
        isDisabled={false}
        />
      <div ref={ref} className="p-3">
        <table>
          <thead>
            <tr>
              <th>column 1</th>
              <th>column 2</th>
              <th>column 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>data 1</td>
              <td>data 2</td>
              <td>data 3</td>
            </tr>
            <tr>
              <td>data 1</td>
              <td>data 2</td>
              <td>data 3</td>
            </tr>
            <tr>
              <td>data 1</td>
              <td>data 2</td>
              <td>data 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PrintTable;
