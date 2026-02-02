// API Configuration for NEMY Frontend
import { Platform } from "react-native";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Always check for environment variable first
  const envBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envBackendUrl) {
    return envBackendUrl;
  }

  if (__DEV__) {
    // Development mode fallback
    if (Platform.OS === "web") {
      return "http://localhost:5000";
    }
    return "http://localhost:5000";
  }

  // Production mode
  return "https://api.nemy.mx";
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      VERIFY_PHONE: "/api/auth/verify-phone",
      SEND_CODE: "/api/auth/send-code",
      LOGIN: "/api/auth/login",
      LOGOUT: "/api/auth/logout",
    },
    BUSINESSES: {
      LIST: "/api/businesses",
      DETAIL: (id: string) => `/api/businesses/${id}`,
      PRODUCTS: (id: string) => `/api/businesses/${id}/products`,
    },
    ORDERS: {
      CREATE: "/api/orders",
      LIST: "/api/orders",
      DETAIL: (id: string) => `/api/orders/${id}`,
      UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
    },
    USERS: {
      PROFILE: "/api/users/profile",
      UPDATE: "/api/users/profile",
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Default headers for API requests
export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

console.log("🔗 API Configuration:", {
  baseUrl: API_CONFIG.BASE_URL,
  isDev: __DEV__,
  platform: Platform.OS,
});
