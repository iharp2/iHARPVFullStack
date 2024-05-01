import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:6085/",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer token",
  },
});

export default axiosInstance;
