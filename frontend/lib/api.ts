import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
});

/**
 * Call this once (e.g. in a top-level client component / hook) with the Clerk
 * `getToken` function so every request carries a fresh session JWT.
 *
 * Usage in a component:
 *   const { getToken } = useAuth();
 *   useEffect(() => { attachAuthInterceptor(getToken); }, []);
 */
export function attachAuthInterceptor(getToken: () => Promise<string | null>) {
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
