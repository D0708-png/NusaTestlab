import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type {
  HttpApiConnectorConfig,
  HttpRequestOptions,
  HttpResponseResult
} from "./types.js";

export class HttpApiConnector {
  private readonly client: AxiosInstance;

  constructor(private readonly config: HttpApiConnectorConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeoutMs,
      validateStatus: () => true
    });
  }

  async request(options: HttpRequestOptions): Promise<HttpResponseResult> {
    const startedAt = Date.now();

    try {
      const requestConfig: AxiosRequestConfig = {
        url: options.path,
        method: options.method,
        headers: options.headers,
        params: options.query,
        data: options.body
      };

      const response = await this.client.request(requestConfig);
      const durationMs = Date.now() - startedAt;

      return {
        ok: response.status >= 200 && response.status < 400,
        method: options.method,
        path: options.path,
        status: response.status,
        statusText: response.statusText,
        durationMs,
        headers: Object.fromEntries(Object.entries(response.headers ?? {})),
        data: response.data
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : String(error);

      return {
        ok: false,
        method: options.method,
        path: options.path,
        status: 0,
        durationMs,
        error: message
      };
    }
  }
}
