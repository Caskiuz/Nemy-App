import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_CONFIG } from "@/constants/api";

/**
 * Gets the base URL for the Express API server
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  return API_CONFIG.BASE_URL;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  // Get token from AsyncStorage
  let token = null;
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const stored = await AsyncStorage.getItem('@nemy_user');
    if (stored) {
      const user = JSON.parse(stored);
      token = user.token;
    }
  } catch (error) {
    // Silent fail
  }

  const headers: Record<string, string> = {};
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    // Get token from AsyncStorage
    let token = null;
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('@nemy_user');
      if (stored) {
        const user = JSON.parse(stored);
        token = user.token;
      }
    } catch (error) {
      // Silent fail
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
