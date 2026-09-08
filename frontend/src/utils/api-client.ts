import { API_TIMEOUT_MS } from "@/constants";
import { ApiError } from "@/utils/api-error-handler";
import type { ApiErrorPayload, ApiRequestOptions, QueryParams, QueryValue } from "@/types";

type TokenProvider = () => string | null | Promise<string | null>;

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function appendQueryValue(searchParams: URLSearchParams, key: string, value: QueryValue) {
  const values = Array.isArray(value) ? value : [value];
  values.forEach((item) => {
    if (item === null || item === undefined || item === "") return;
    searchParams.append(key, item instanceof Date ? item.toISOString() : String(item));
  });
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams) {
  const normalizedBase = `${baseUrl.replace(/\/$/, "")}/`;
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(normalizedPath, normalizedBase);

  if (query) {
    Object.entries(query).forEach(([key, value]) => appendQueryValue(url.searchParams, key, value));
  }

  return url.toString();
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

export class ApiClient {
  private tokenProvider?: TokenProvider;

  constructor(private readonly baseUrl = configuredBaseUrl) {}

  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  async request<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
    const {
      body,
      headers: providedHeaders,
      query,
      timeoutMs = API_TIMEOUT_MS,
      token: providedToken,
      signal: externalSignal,
      ...requestInit
    } = options;
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
    const abortFromExternalSignal = () => controller.abort(externalSignal?.reason);
    externalSignal?.addEventListener("abort", abortFromExternalSignal, { once: true });

    try {
      const token = providedToken ?? (await this.tokenProvider?.());
      const headers = new Headers(providedHeaders);
      headers.set("Accept", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
      if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(buildUrl(this.baseUrl, path, query), {
        ...requestInit,
        body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
        headers,
        signal: controller.signal,
      });
      const payload = await parseResponseBody(response);

      if (!response.ok) {
        const errorPayload = typeof payload === "object" && payload !== null ? (payload as ApiErrorPayload) : undefined;
        throw new ApiError(response.status, errorPayload, response.statusText || "Request failed");
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("The request timed out or was cancelled.");
      }
      throw error;
    } finally {
      globalThis.clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abortFromExternalSignal);
    }
  }

  get<TResponse>(path: string, options?: ApiRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "GET" });
  }

  post<TResponse>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<TResponse>(path, { ...options, body, method: "POST" });
  }

  put<TResponse>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<TResponse>(path, { ...options, body, method: "PUT" });
  }

  patch<TResponse>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<TResponse>(path, { ...options, body, method: "PATCH" });
  }

  delete<TResponse>(path: string, options?: ApiRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
