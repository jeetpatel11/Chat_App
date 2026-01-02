import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "http://13.205.7.6:5001/api",  // <--- add your backend IP and port
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
