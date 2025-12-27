import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useApi<T>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher);

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
