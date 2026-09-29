import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jansetu_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, try one silent refresh using the refresh token before giving up
// and forcing the user back to the login screen.
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("jansetu_refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken });
        localStorage.setItem("jansetu_access_token", data.access_token);
        localStorage.setItem("jansetu_refresh_token", data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ---- Grouped endpoint helpers -------------------------------------------

export const authApi = {
  signup: (payload) => api.post("/api/auth/signup", payload),
  requestOtp: (payload) => api.post("/api/auth/otp/request", payload),
  verifyOtp: (payload) => api.post("/api/auth/otp/verify", payload),
  login: (payload) => api.post("/api/auth/login", payload),
  me: () => api.get("/api/auth/me"),
};

export const profileApi = {
  get: () => api.get("/api/profile/me"),
  upsert: (payload) => api.put("/api/profile/me", payload),
};

export const schemesApi = {
  list: (category) => api.get("/api/schemes", { params: category ? { category } : {} }),
  detail: (id) => api.get(`/api/schemes/${id}`),
  eligibility: () => api.get("/api/schemes/eligibility"),
};

export const applicationsApi = {
  list: () => api.get("/api/applications"),
  create: (schemeId) => api.post("/api/applications", { scheme_id: schemeId }),
  autosave: (id, payload) => api.patch(`/api/applications/${id}/autosave`, payload),
  submit: (id, payload) => api.post(`/api/applications/${id}/submit`, payload),
  get: (id) => api.get(`/api/applications/${id}`),
};

export const documentsApi = {
  list: () => api.get("/api/documents"),
  upload: (docType, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/documents/upload?doc_type=${docType}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => api.delete(`/api/documents/${id}`),
};

export const notificationsApi = {
  list: () => api.get("/api/notifications"),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
};

export const voiceApi = {
  command: (transcript) => api.post("/api/voice/command", { transcript }),
};
