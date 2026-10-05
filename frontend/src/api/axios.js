import axios from "axios";
import { safeStorage } from "../utils/storage";
let rawApiUrl = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/$/, "");
if (rawApiUrl.startsWith("http") && !rawApiUrl.endsWith("/api")) {
  rawApiUrl += "/api";
}
const API_URL = rawApiUrl;
const customFetchAdapter = async (config) => {
  const cleanBase = config.baseURL ? config.baseURL.replace(/\/$/, "") : "/api";
  const urlPath = config.url?.startsWith("/") ? config.url : `/${config.url || ""}`;
  let finalUrl = config.url?.startsWith("http://") || config.url?.startsWith("https://") ? config.url : `${cleanBase}${urlPath}`;
  if (config.params) {
    const searchParams = new URLSearchParams();
    Object.entries(config.params).forEach(([key, val]) => {
      if (val !== void 0 && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs;
    }
  }
  const headers = {};
  if (config.headers) {
    if (typeof config.headers.toJSON === "function") {
      Object.assign(headers, config.headers.toJSON());
    } else {
      Object.assign(headers, config.headers);
    }
  }
  const token = safeStorage.getItem("fitsync_token");
  if (token && !headers["Authorization"] && !headers["authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let body = config.data;
  const method = (config.method || "GET").toUpperCase();
  if (body !== void 0 && body !== null && !["GET", "HEAD"].includes(method)) {
    if (typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
      body = JSON.stringify(body);
      if (!headers["Content-Type"] && !headers["content-type"]) {
        headers["Content-Type"] = "application/json";
      }
    }
  } else {
    body = void 0;
  }
  const executeFetch = async (attempt = 0) => {
    try {
      const response = await fetch(finalUrl, {
        method,
        headers,
        body,
        credentials: attempt > 0 ? "omit" : "same-origin"
      });
      const contentType = response.headers.get("content-type") || "";
      let responseData;
      if (contentType.includes("application/json")) {
        responseData = await response.json().catch(() => ({}));
      } else {
        responseData = await response.text();
      }
      if (!response.ok) {
        const error = new Error(responseData?.message || `Request failed with status ${response.status}`);
        error.config = config;
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: response.headers
        };
        throw error;
      }
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config
      };
    } catch (err) {
      if (attempt < 3 && (!err.response || err.name === "TypeError" || err.message === "Failed to fetch")) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        return executeFetch(attempt + 1);
      }
      throw err;
    }
  };
  return executeFetch(0);
};
const apiClient = axios.create({
  baseURL: API_URL,
  adapter: customFetchAdapter,
  timeout: 15e3
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
      if (!isAuthRoute) {
        safeStorage.removeItem("fitsync_token");
        safeStorage.removeItem("fitsync_user");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
var stdin_default = apiClient;
export {
  apiClient,
  stdin_default as default
};


