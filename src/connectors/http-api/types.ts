export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpApiConnectorConfig {
  baseURL: string;
  timeoutMs: number;
}

export interface HttpRequestOptions {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export interface HttpResponseResult {
  ok: boolean;
  method: HttpMethod;
  path: string;
  status: number;
  statusText?: string;
  durationMs: number;
  headers?: Record<string, unknown>;
  data?: unknown;
  error?: string;
}
