import axios from "axios";

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

const FALLBACK_ERROR_MESSAGE = "Unexpected error occurred while fetching data.";

export const fetcher = async (url: string) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const message =
        error.response?.data?.message ?? error.message ?? FALLBACK_ERROR_MESSAGE;

      console.error("API request failed", {
        url,
        status: error.response?.status,
        message: error.message,
      });

      if (message !== error.message) {
        error.message = message;
      }

      throw error;
    }

    console.error("Unexpected non-Axios error", { url, error });

    throw error instanceof Error ? error : new Error(FALLBACK_ERROR_MESSAGE);
  }
};

export default api;
