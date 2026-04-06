import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Base path set panniyachu
  headers: {},
  withCredentials: true, // Cookies handle panna ithu mukkiyam
});

export const socketApi = axios.create({
  // Inga dhaan namma .env-la irukka 5178 port URL-ah edukkurom
  baseURL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  // baseURL:process.env.NEXT_PUBLIC_SOCKET_CPANEL_SERVER_URL,
  withCredentials: true,
});

// Response Interceptor (Error handling-ah centralized-ah panna)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expire aagi 401 vandha automatic-ah login-ku anupalam
    if (error.response && error.response.status === 401) {
      // window.location.href = "/unauthorized";
    }
    return Promise.reject(error);
  },
);

export default api;
