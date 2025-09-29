// lib/api.ts
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

/* ---------------- URL utils ---------------- */

function stripTrailingSlashes(url: string) {
  return url.replace(/\/+$/, "");
}

function adaptLocalhostForDevice(url: string) {
  try {
    const u = new URL(url);
    const isHttp = u.protocol === "http:" || u.protocol === "https:";
    if (!isHttp) return url;

    const host = u.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0";

    if (!isLocal) return url;

    // Android emulador acessa host via 10.0.2.2
    if (Platform.OS === "android") {
      u.hostname = "10.0.2.2";
      return u.toString();
    }

    return url;
  } catch {
    return url;
  }
}

export function resolveBaseURL(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
  const fromExtra = Constants.expoConfig?.extra?.API_BASE_URL as string | undefined;

  const chosen = fromEnv ?? fromExtra;
  if (!chosen) {
    throw new Error(
      "API_BASE_URL não definida. Configure EXPO_PUBLIC_API_BASE_URL ou extra.API_BASE_URL."
    );
  }
  if (!/^https?:\/\//i.test(chosen)) {
    throw new Error(
      `API_BASE_URL inválida: "${chosen}". Inclua o protocolo (ex.: https://...).`
    );
  }

  const normalized = stripTrailingSlashes(chosen);
  return adaptLocalhostForDevice(normalized);
}

/* ---------------- Tipos ---------------- */

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  preferencesSet?: boolean;
  preferences?: string[];
};

export type ApiEvent = {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  latitude?: number | null;
  longitude?: number | null;
  startDate?: string | null;
  endDate?: string | null; // opcional se você já usa
  categories?: string[];
  aprovado: boolean;
  likes?: { userId: string }[];
  likesCount?: number;
  likedByUser?: boolean;
};

export type ApiBanner = {
  id: string | number;
  imageUrl: string;
  title?: string;
  displaySeconds?: number;
};

export type EventsQuery = {
  title?: string;
  service?: string;
};

export type HighlightsPayload = {
  mostLikedId: string | null;
  mostAccessedId: string | null;
};

/* ---------------- Instância Axios ---------------- */

let baseURL = resolveBaseURL();

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Platform": Platform.OS,
    "X-Client-Version": String(Constants.expoConfig?.version ?? "unknown"),
    "X-Release-Channel": String(
      (Constants.expoConfig as any)?.extra?.eas?.channel ?? "default"
    ),
  },
});

export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
export const clearAuthToken = () => setAuthToken(null);

export function bootstrapAuthFrom(payload?: {
  accessToken?: string | null;
  user?: ApiUser | null;
}) {
  if (payload?.accessToken) setAuthToken(payload.accessToken);
}

export function updateBaseURL(nextBaseUrl: string) {
  const normalized = adaptLocalhostForDevice(stripTrailingSlashes(nextBaseUrl));
  api.defaults.baseURL = normalized;
  baseURL = normalized;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (__DEV__) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const relUrl = err?.config?.url ?? "";
      const absUrl = relUrl.startsWith("http")
        ? relUrl
        : `${err?.config?.baseURL ?? baseURL}${relUrl}`;
      console.log("❌ API error", { status, url: absUrl, data });
    }
    return Promise.reject(err);
  }
);

/* ---------------- Helpers ---------------- */

export const apiHelpers = {
  // lista de eventos (com query opcional)
  events: async (query: EventsQuery = {}) => {
    const params = new URLSearchParams();
    if (query.title) params.set("title", query.title);
    if (query.service) params.set("service", query.service);

    const qs = params.toString();
    const url = `/api/events${qs ? `?${qs}` : ""}`;

    const res = await api.get<ApiEvent[]>(url);
    return res.data;
  },

  likeEvent: async (id: string) =>
    (await api.post<{ liked: boolean; count: number }>(`/api/events/${id}/like`)).data,

  banners: async () => (await api.get<ApiBanner[]>("/api/banners")).data,

  me: async () =>
    (await api.get<{ user: ApiUser | null; accessToken?: string }>("/api/auth/me")).data,

  mobileLogin: async (payload: { id_token: string }) =>
    (await api.post<{ user: ApiUser; accessToken: string }>("/api/mobile-login", payload)).data,

  getUserPreferences: async () =>
    (await api.get<ApiUser>("/api/users/preferences")).data,

  saveUserPreferences: async (preferences: string[]) =>
    (await api.post<{ message: string }>("/api/users/preferences", { preferences })).data,

  // ✅ NOVO: destaques globais (usa sua rota Next.js /api/events/highlights)
  getHighlights: async () =>
    (await api.get<HighlightsPayload>("/api/events/highlights")).data,
};
