import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}