// src/api/api.client.ts

import { API_CONFIG } from "./api.config";

type ApiRequestOptions = {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export const apiClient = async ({
  endpoint,
  method = "POST",
  body,
  headers = {},
}: ApiRequestOptions) => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${endpoint}`,
    {
      method,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "API Error");
  }

  return json;
};
