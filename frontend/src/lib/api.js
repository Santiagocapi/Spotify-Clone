import axios from "axios";

const api = axios.create();

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage
      localStorage.removeItem("user");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
