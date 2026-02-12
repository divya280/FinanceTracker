import axios from "axios";

// Create axios instance with base URL
// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
console.log(import.meta.env.VITE_API_BASE_URL);


// Add a request interceptor
api.interceptors.request.use(async (config) => {
  // Import auth dynamically or from a helper to avoid circular deps if possible
  // But here we can import from firebase.js
  const { auth } = await import("../firebase"); 
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// User API
export const userApi = {
  create: (data) => api.post("/users", data),
  getAll: () => api.get("/users"),
  update: (id, data) => api.put(`/users/${id}`, data), // Note: Route in backend is /:data but likely meant /:id, check backend
  delete: (id) => api.delete(`/users/${id}`),
};

// Transaction API
export const transactionApi = {
  create: (data) => api.post("/transactions", data),
  getAll: () => api.get("/transactions"),
  getByUser: (userId) => api.get(`/transactions/user/${userId}`),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export default api;
