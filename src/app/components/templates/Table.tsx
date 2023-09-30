import React from 'react'

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
    return (
        <>
            <table className='table-auto w-full'>
                <thead>
                    <tr className='h-[60px] bg-[#F1F3F9]'>
                        <th>
                            <input type='checkbox' />
                        </th>
                        {tableHead.map(item => <th className='cursor-pointer'>{item}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr className='text-center h-[60px] border-b bg-[#FFF] hover:bg-[#EAF2FF] hover:text-[#3B8FEE] cursor-pointer'>
                            <th>
                                <input type='checkbox' value={item.id} name="itemdata" />
                            </th>
                            <td>{item.id}</td>
                            <td>{item.firstName}</td>
                            <td>{item.lastName}</td>
                            <td>{item.department}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

export default Table
