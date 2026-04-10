import { useState, useCallback } from 'react';

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: () => Promise<void>;
} {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({
    data: null,
    error: null,
    loading: immediate,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    try {
      const result = await asyncFunction();
      setState({ data: result, error: null, loading: false });
    } catch (error) {
      setState({ data: null, error: error as Error, loading: false });
    }
  }, [asyncFunction]);

  return {
    ...state,
    execute,
  };
}
