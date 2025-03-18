import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get base URL for API calls
function getBaseUrl() {
  // If we're in the browser
  if (typeof window !== 'undefined') {
    // Use the current origin in production
    return window.location.origin;
  }
  // Fallback for SSR or during build
  return 'http://localhost:5000';
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(errorData.error || `${res.status}: ${res.statusText}`);
      } else {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure URL is properly formatted with base URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${getBaseUrl()}${url}`;
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const urlKey = queryKey[0] as string;
    // Ensure URL is properly formatted with base URL if it's a relative path
    const fullUrl = urlKey.startsWith('http') ? urlKey : `${getBaseUrl()}${urlKey}`;
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query Error (${urlKey}):`, error);
      // Re-throw to let react-query handle it
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1, // Allow one retry for transient network issues
    },
    mutations: {
      retry: 1, // Allow one retry for transient network issues
    },
  },
});
