// API Configuration for NEMY Frontend
import { Platform } from "react-native";

// Get API base URL dynamically at runtime
export const getApiBaseUrl = (): string => {
  // For web in production, always use current origin (same domain)
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    // In production web, API is served from same origin
    if (!__DEV__) {
      return window.location.origin;
    }
  }

  // Check for environment variable
  const envBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envBackendUrl) {
    return envBackendUrl;
  }

  // Check for Replit domain
  const replitDomain = process.env.EXPO_PUBLIC_DOMAIN;
  if (replitDomain) {
    return `https://${replitDomain}`;
  }

  // Development mode fallback
  if (__DEV__) {
    return "http://localhost:5000";
  }

  // Final fallback for native apps in production
  return "https://api.nemy.mx";
};

export const API_CONFIG = {
  get BASE_URL() {
    return getApiBaseUrl();
  },
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
