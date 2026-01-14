import { $fetch } from "ofetch";

export type RequestBody = Record<string, unknown>;
export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiOptions {
  method?: RequestMethod;
  body?: RequestBody;
  signal?: AbortSignal;
  query?: Record<string, unknown>;
}

// Overload 1: Just URL (GET request)
export async function useApi<T = unknown>(url: string): Promise<T>;

// Overload 2: URL + options
export async function useApi<T = unknown>(
  url: string,
  options: ApiOptions,
): Promise<T>;

export async function useApi<T = unknown>(
  url: string,
  options?: ApiOptions,
): Promise<T> {
  return (await $fetch(url, {
    method: options?.method || "GET",
    body: options?.body,
    signal: options?.signal,
    query: options?.query,
  })) as T;
}
