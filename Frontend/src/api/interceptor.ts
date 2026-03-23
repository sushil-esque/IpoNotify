import { toast } from "sonner";
import axios, { AxiosError, type AxiosResponse } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

  

function axiosFulfilled(e: AxiosResponse) {
  return e.data;
}
function axiosRejected(e: AxiosError) {
  if (e.response) {
    if (e.response.status === 401) {
      if (sessionStorage.getItem("isLoggedIn") === "true") {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("isLoggedIn");
      }
      return Promise.reject(e.response.data);
    }
    if (e.response.status === 404) {
      return Promise.reject(e.response.data);
    }
    if (e.response.status === 500) {
      return Promise.reject(e.response.data);
    }
    if (e.response.status === 409) {
      return Promise.reject(e.response.data);
    }
    if (e.response.status === 400) {
      return Promise.reject(e.response.data);
    }

    return Promise.reject(e.response.data);
  }
  return Promise.reject("Something went wrong!!!");
}
api.interceptors.response.use(axiosFulfilled, axiosRejected);
