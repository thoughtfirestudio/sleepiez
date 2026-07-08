import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic hook for fetching API data with loading/error states
 * and optional mock fallback when the API is unavailable.
 */
export function useApi<T>(
  path: string | null,
  mock: T | null = null,
  options?: { immediate?: boolean }
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!path) {
      setData(mock);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path);
      setData(result);
    } catch (err) {
      console.warn(`[useApi] ${path} failed, using mock:`, err);
      setData(mock);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (options?.immediate === false) return;
    fetchData();
  }, [fetchData, options?.immediate]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for mutations (POST, PATCH, DELETE).
 */
export function useMutation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      method: "post" | "patch" | "del",
      path: string,
      body?: unknown
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api[method]<T>(path, body);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Mutation failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}
