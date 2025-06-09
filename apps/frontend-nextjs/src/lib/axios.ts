import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true, // Important for HttpOnly cookie
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error);
  }
);

// api.interceptors.request.use((config) => {
//   console.log(
//     "[API REQUEST]",
//     config.method?.toUpperCase(),
//     config.baseURL + config.url,
//     config
//   );
//   return config;
// });
