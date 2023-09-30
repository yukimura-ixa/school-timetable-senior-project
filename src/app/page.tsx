"use client";
import React, { useState } from "react";
import Image from "next/image";
import Button from "./components/elements/static/Button";
// Svg icon
import adduserIcon from "@/svg/adduser.svg";
// component
import TextField from "@/app/components/elements/input/field/TextField";
import Dropdown from "@/app/components/elements/input/selected_input/Dropdown";
import MiniButton from "./components/elements/static/MiniButton";
import SearchBar from "./components/elements/input/field/SearchBar";
import CheckBox from "./components/elements/input/selected_input/CheckBox";
import Table from "./components/templates/Table";
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
    searchName(text)
  }
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
    let res = copyNameList.filter(item => `${item.fName} ${item.lName}`.match(name));
    setNameList(res);
    console.log(res);
  }

  //Render Dropdown Test
  const renderItem = ({ data }): JSX.Element => (
    <p>
      {data.fName} {data.lName}
    </p>
  );
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="mb-32 grid text-center gap-10 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <p>{selectedName} was selected.</p>
        <p>{text} was typed.</p>
        <p>this is search text '{searchText}'</p>
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
        <SearchBar placeHolder="ค้นหาวิชาเรียน" handleChange={handleChangeText}/>
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
      <div className="w-full h-screen">
          <Table />
      </div>
    </main>
  );
}
