// API Configuration for NEMY Frontend
import { Platform } from "react-native";

// Get API base URL dynamically at runtime
export const getApiBaseUrl = (): string => {
  // Check for environment variable first (production)
  const envBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envBackendUrl) {
    console.log('Using EXPO_PUBLIC_BACKEND_URL:', envBackendUrl);
    return envBackendUrl;
  }

  // Development mode - use localhost
  if (__DEV__) {
    console.log('🔧 Development mode: using localhost:5000');
    return "http://localhost:5000";
  }

  // For web in production, use current origin (same domain)
  if (Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }

  // Final fallback
  console.warn('No backend URL configured, using fallback');
  return "https://nemy-app.replit.app";
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
      PROFILE: "/api/user/profile",
      UPDATE: "/api/user/profile",
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
