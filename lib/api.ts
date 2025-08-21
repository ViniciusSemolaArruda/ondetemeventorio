// lib/api.ts
import axios from "axios";
import Constants from "expo-constants";

function resolveBaseURL() {
  // 1) app.json/app.config.js → extra.API_BASE_URL
  const fromExtra = Constants.expoConfig?.extra?.API_BASE_URL as string | undefined;
  // 2) EAS env pública
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;

  const url = fromExtra ?? fromEnv;

  if (!url) {
    console.warn("⚠️ API_BASE_URL não definida. Configure extra.API_BASE_URL ou EXPO_PUBLIC_API_BASE_URL.");
    return undefined;
  }

  // Em device físico, substituir localhost por IP da máquina:
  // ex: http://192.168.0.xxx:3000
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)) {
    console.warn("⚠️ API_BASE_URL aponta para localhost; em device físico não funciona. Use o IP da sua máquina.");
  }

  // Opcional: remover barra final
  return url.replace(/\/+$/, "");
}

const baseURL = resolveBaseURL();

export const api = axios.create({
  baseURL: baseURL,                 // se undefined, axios usa requests relativos; prefira definir.
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Auth helper
export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// (Opcional) Interceptor para logar 401/5xx em dev
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (__DEV__) {
      console.log("❌ API error:", {
        url: err?.config?.url,
        status: err?.response?.status,
        data: err?.response?.data,
      });
    }
    return Promise.reject(err);
  }
);
