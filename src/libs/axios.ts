import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  timeout: 60000, // 1 min
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8",
  },
})

export const fetcher = async (url: string) => {
  return await api.get(url)
    .then((res) => res.data)
    .catch((error) => {
      console.log("axios error", error.code)
    })
}

export default api
