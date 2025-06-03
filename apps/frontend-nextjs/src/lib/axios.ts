import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // Goes through the API gateway
  withCredentials: true, // Important for HttpOnly cookie
});
