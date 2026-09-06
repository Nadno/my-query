import { computed, signal } from '@preact/signals-core';
import type { AuthResponse, ProfilePayload, RegisterPayload, UserPublic } from '../../../shared/types';
import { ApiError, send } from '../api';
import { useToast } from './useToast';

export type Screen = 'login' | 'register' | 'app';

export const screen = signal<Screen>('login');
export const accessToken = signal<string | null>(null);
export const user = signal<UserPublic | null>(null);
export const session = computed(() =>
  accessToken.value ? { accessToken: accessToken.value, user: user.value } : null,
);
export const isAuthenticated = computed(() => !!accessToken.value);

let refreshTimer: number | undefined;
let refreshInFlight: Promise<boolean> | null = null;

function applyAuth(res: AuthResponse) {
  accessToken.value = res.accessToken;
  user.value = res.user;
  scheduleRefresh(res.expiresIn);
}

function scheduleRefresh(expiresIn: number) {
  window.clearTimeout(refreshTimer);
  const wait = Math.max(1000, (expiresIn - 30) * 1000);
  refreshTimer = window.setTimeout(() => {
    void refresh().then((ok) => {
      if (!ok) expireSession();
    });
  }, wait);
}

export function expireSession(message = 'Sessão expirada. Faça login novamente.') {
  accessToken.value = null;
  user.value = null;
  window.clearTimeout(refreshTimer);
  screen.value = 'login';
  useToast().error(message);
}

export async function refresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await send<AuthResponse>('/refresh', { method: 'POST' });
      applyAuth(res);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function authed<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  try {
    return await send<T>(path, { ...init, token: accessToken.value });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && retry && path !== '/refresh') {
      const ok = await refresh();
      if (ok) return authed<T>(path, init, false);
      expireSession();
    }
    throw err;
  }
}

export async function login(email: string, password: string) {
  const res = await send<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  applyAuth(res);
  screen.value = 'app';
}

export async function register(payload: RegisterPayload) {
  await send('/register', { method: 'POST', body: JSON.stringify(payload) });
  useToast().success('Cadastro realizado. Entre com seu e-mail e senha.');
  screen.value = 'login';
}

export async function logout() {
  try {
    await send('/logout', { method: 'POST', token: accessToken.value });
  } catch {
    /* cookie/token já inválidos */
  }
  accessToken.value = null;
  user.value = null;
  window.clearTimeout(refreshTimer);
  screen.value = 'login';
}

export async function updateMe(payload: ProfilePayload) {
  const me = await authed<UserPublic>('/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  user.value = me;
  return me;
}

export function getAccessToken() {
  return accessToken.value;
}

export function useAuth() {
  return {
    session,
    user,
    isAuthenticated,
    screen,
    login,
    register,
    logout,
    refresh,
    updateMe,
  };
}
