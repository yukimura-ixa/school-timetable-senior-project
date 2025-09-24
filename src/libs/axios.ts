import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  timeout: 60000, // 1 min
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8",
  },
});

type ApiErrorResponse = {
  message?: string;
};

export const fetcher = async (url: string) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ??
      axiosError.message ??
      "Unexpected error occurred while fetching data.";

    console.error("API request failed", {
      url,
      status: axiosError.response?.status,
      message: axiosError.message,
    });

    throw new Error(message);
  }
};

export default api;
