'use client'
import { createTheme } from "@mui/material"
import { Sarabun } from "next/font/google"
const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ['300', '400', '500', '700'], })
const theme = createTheme({
    typography: {
        fontFamily: sarabun.style.fontFamily,
    },
})

export default theme