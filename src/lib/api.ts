import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { CreatePractice, Message, Page, Practice, PracticeResult, Reply, Scenario } from "./types";
import { clearPendingSends, uncertainSends } from "./pending";
import { ApiError, createHttpClient } from "./http";
export { ApiError } from "./http";

export interface User {
  id: string;
  displayName: string;
  email: string;
  timeZone: string;
  emailVerifiedAt: string | null;
}
interface Tokens { accessToken: string; expiresIn: number; refreshToken?: string }

const web = Platform.OS === "web";
const base = (process.env.EXPO_PUBLIC_API_URL ?? (web ? "http://localhost:3000/api/v1" : "http://10.0.2.2:3000/api/v1")).replace(/\/$/, "");
const http = createHttpClient({ baseUrl: base, web });
const refreshKey = "neurotalk.refresh";
let accessToken: string | undefined;
let renewal: Promise<void> | undefined;
const expiredListeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) { expiredListeners.add(listener); return () => { expiredListeners.delete(listener); }; }

async function request<T>(path: string, method = "GET", body?: unknown, authenticated = false): Promise<T> {
  return http<T>(path, method, body, authenticated ? accessToken : undefined);
}

async function saveTokens(tokens: Tokens) {
  if (!web && tokens.refreshToken) await SecureStore.setItemAsync(refreshKey, tokens.refreshToken);
  accessToken = tokens.accessToken;
}

export async function clearLocalSession() {
  accessToken = undefined;
  clearPendingSends();
  if (!web) await SecureStore.deleteItemAsync(refreshKey);
}

async function refresh() {
  if (!renewal) {
    renewal = (async () => {
      const refreshToken = web ? undefined : await SecureStore.getItemAsync(refreshKey);
      if (!web && !refreshToken) throw new ApiError("Inicia sesión.", 401, "UNAUTHENTICATED");
      const tokens = await request<Tokens>("/auth/refresh", "POST", { platform: web ? "web" : "android", ...(refreshToken ? { refreshToken } : {}) });
      await saveTokens(tokens);
    })().finally(() => { renewal = undefined; });
  }
  return renewal;
}

async function authorized<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  try { return await request<T>(path, method, body, true); }
  catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    try {
      await refresh();
      return await request<T>(path, method, body, true);
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) {
        await clearLocalSession();
        expiredListeners.forEach((listener) => listener());
      }
      throw failure;
    }
  }
}

export const api = {
  health: () => request<{ status: string; mode: string }>("/health"),
  register: (displayName: string, email: string, password: string) => request<{ user: User }>("/auth/register", "POST", { displayName, email, password }),
  async login(email: string, password: string) {
    const result = await request<Tokens & { user: User }>("/auth/login", "POST", { email, password, platform: web ? "web" : "android" });
    await saveTokens(result);
    return result.user;
  },
  async restore(): Promise<User | null> {
    try { await refresh(); return await authorized<User>("/users/me"); }
    catch (error) {
      if (error instanceof ApiError && error.status === 401) { await clearLocalSession(); return null; }
      throw error;
    }
  },
  me: () => authorized<User>("/users/me"),
  updateProfile: (displayName: string) => authorized<User>("/users/me", "PATCH", { displayName }),
  async logout() { await authorized<void>("/auth/logout", "POST"); await clearLocalSession(); },
  async deleteAccount(password: string) { await authorized<void>("/users/me", "DELETE", { password }); await clearLocalSession(); },
  scenarios: () => authorized<Page<Scenario>>("/scenarios"),
  scenario: (id: string) => authorized<Scenario>(`/scenarios/${id}`),
  createPractice: (input: CreatePractice) => authorized<Practice>("/practices", "POST", input),
  practice: (id: string) => authorized<Practice>(`/practices/${id}`),
  practices: (options: { scope?: "unfinished"; status?: "COMPLETED"; cursor?: string } = {}) => {
    const params = new URLSearchParams({ limit: "20", ...options });
    return authorized<Page<Practice>>(`/practices?${params}`);
  },
  async messages(id: string): Promise<Message[]> {
    const items: Message[] = [];
    let cursor: string | null = null;
    do {
      const page: Page<Message> = await authorized(`/practices/${id}/messages?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
      items.push(...page.items); cursor = page.nextCursor;
    } while (cursor);
    return items;
  },
  sendMessage: (id: string, input: { clientMessageId: string; content: string }) => authorized<{ message: Message; replyOperationId: string; practice: Practice }>(`/practices/${id}/messages`, "POST", input),
  reply: (id: string, operationId: string) => authorized<Reply & { message: Message | null }>(`/practices/${id}/replies/${operationId}`),
  retryReply: (id: string, operationId: string) => authorized<Reply>(`/practices/${id}/replies/${operationId}/retry`, "POST"),
  pause: (id: string, reason: "USER_REQUEST" | "LEFT_CHAT" = "USER_REQUEST") => authorized<Practice>(`/practices/${id}/pause`, "POST", { reason }),
  resume: (id: string) => authorized<Practice>(`/practices/${id}/resume`, "POST"),
  finish: (id: string) => authorized<Practice>(`/practices/${id}/finish`, "POST"),
  async deletePractice(id: string) { await authorized<void>(`/practices/${id}`, "DELETE"); uncertainSends.delete(id); },
  result: (id: string) => authorized<PracticeResult>(`/practices/${id}/result`),
};
