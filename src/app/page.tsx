"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "./components/elements/static/Button";
// Svg icon
import adduserIcon from "@/svg/user/adduser.svg";
// component
import TextField from "@/app/components/elements/input/field/TextField";
import Dropdown from "@/app/components/elements/input/selected_input/Dropdown";
import MiniButton from "./components/elements/static/MiniButton";
import SearchBar from "./components/elements/input/field/SearchBar";
import CheckBox from "./components/elements/input/selected_input/CheckBox";
import Table from "./components/templates/Table";
import Navbar from "./components/templates/Navbar";
import Menubar from "./components/templates/Menubar";
export default function Home() {
  const [text, setText] = useState("");
  const [selectedName, setSelectedName] = useState();
  interface name {
    fName: string;
    lName: string;
  }
  const [nameList, setNameList] = useState([
    {
      fName: "Danny",
      lName: "Lee",
    },
    {
      fName: "Ricardo",
      lName: "Milos",
    },
    {
      fName: "Tim",
      lName: "Carlton",
    },
    {
      fName: "Ricardo",
      lName: "Kaka",
    },
    {
      fName: "Billy",
      lName: "Harrington",
    },
  ]);
  const tableData: any[] = [
    {
      id: "f123124",
      firstName: "Ricardo",
      lastName: "Milos",
      department: "Dance",
    },
    {
      id: "d121",
      firstName: "Billy",
      lastName: "Harrington",
      department: "Trainer",
    },
    {
      id: "degdfd",
      firstName: "Tim",
      lastName: "Carlton",
      department: "Surfskate",
    },
    {
      id: "saokppo",
      firstName: "Danny",
      lastName: "Lee",
      department: "Artist",
    },
  ];
  const tableHead: string[] = ["IDs", "Firstname", "Lastname", "Department"];
  //TextField Handle Change Test
  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  //Select Dropdown Item Test
  const dropDownSelected = (name: name) => {
    setSelectedName(() => `${name.fName} ${name.lName}`);
  };

  //Search Dropdown Test
  const [searchText, setSearchText] = useState();
  const handleChangeText = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  const searchName = (name: string) => {
    //ใช้ logic เพื่อทำการ filter item list ที่เราได้มา เพราะมันอาจจะไม่ซ้ำรูปแบบกัน
    const copyNameList = [
      {
        fName: "Danny",
        lName: "Lee",
      },
      {
        fName: "Ricardo",
        lName: "Milos",
      },
      {
        fName: "Ricardo",
        lName: "Kaka",
      },
      {
        fName: "Tim",
        lName: "Carlton",
      },
      {
        fName: "Billy",
        lName: "Harrington",
      },
    ];
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = copyNameList.filter((item) =>
      `${item.fName} ${item.lName}`.match(name)
    );
    setNameList(res);
    console.log(res);
  };

  //Render Dropdown Test
  const renderItem = ({ data }): JSX.Element => (
    <p>
      {data.fName} {data.lName}
    </p>
  );
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch(orderType){
      case 'IDs':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.id.localeCompare(b.id) : b.id.localeCompare(a.id))
      case 'Firstname':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.firstName.toLowerCase().localeCompare(b.firstName) : b.firstName.toLowerCase().localeCompare(a.firstName))
      case 'Lastname':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.lastName.toLowerCase().localeCompare(b.lastName) : b.lastName.toLowerCase().localeCompare(a.lastName))
      case 'Department':
        console.log(orderType);
        return data.sort((a, b) => orderState? a.department.toLowerCase().localeCompare(b.department) : b.department.toLowerCase().localeCompare(a.department))
      default:
        console.log('else')
        return data.sort((a, b) => a.id.localeCompare(b.id))
    }
  }
  return (
    <main className="flex flex-col items-center justify-between">
      <div className="w-full h-[85px] flex justify-center">
            <Navbar />
      </div>
      <Menubar />
      <div className="mb-32 grid text-center gap-10 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <p>{selectedName} was selected.</p>
        <p>{text} was typed.</p>
        <p>this is search text &apos;{searchText}&apos;</p>
        <p className="text-sm ...">The quick brown fox ... sm</p>
        <p className="text-base ...">The quick brown fox ... base</p>
        <p className="text-lg ...">The quick brown fox ... lg</p>
        <p className="text-xl ...">The quick brown fox ... xl</p>
        <p className="text-2xl ...">The quick brown fox ... 2xl</p>
        <Dropdown
          // width="100%"
          data={nameList}
          renderItem={renderItem}
          currentValue={selectedName}
          handleChange={dropDownSelected}
          useSearchBar={true}
          searchFunciton={handleChangeText}
        />
        <Button title="Add user" icon={adduserIcon} buttonColor="#2F80ED" />
        <SearchBar
          placeHolder="ค้นหาวิชาเรียน"
          handleChange={handleChangeText}
        />
        <CheckBox />
        <br></br>
        <div className="flex flex-col items-start gap-10">
          Minibutton Component :
          <MiniButton
            title="Default"
            buttonColor="#F3CFFF"
            titleColor="#591EA4"
            // isSelected={true}
          />
          <MiniButton
            title="Selected = true"
            buttonColor="#FFFFFF"
            titleColor="#000000"
            border={true}
            borderColor="#EDEEF3"
            isSelected={true}
          />
        </div>
        <TextField
          width={300}
          handleChange={handleChange}
          placeHolder="อเนก"
          label="ชื่อจริง (Firstname) :"
        />
      </div>
      <div className="w-[1190px] py-[30px] px-[50px] overflow-auto mt-10">
        <Table
          tableHead={tableHead}
          data={tableData}
          orderByFunction={sortData}
          tableData={({ data, handleChange, index }) => (
            <>
              <td
                className="font-bold px-6 whitespace-nowrap select-none"
                onClick={() => handleChange(index)}
              >
                {data.id}
              </td>
              <td
                className="px-6 whitespace-nowrap select-none"
                onClick={() => handleChange(index)}
              >
                {data.firstName}
              </td>
              <td
                className="px-6 whitespace-nowrap select-none"
                onClick={() => handleChange(index)}
              >
                {data.lastName}
              </td>
              <td
                className="px-6 whitespace-nowrap select-none"
                onClick={() => handleChange(index)}
              >
                {data.department}
              </td>
            </>
          )}
        />
      </div>
    </main>
  );
}
