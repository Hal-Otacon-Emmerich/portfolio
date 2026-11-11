/** Базовый адрес API. Пусто — тот же домен (в dev-режиме работает прокси из vite.config.ts). */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Пока бэкенда нет, данные берутся из mocks.ts. Выключается через VITE_USE_MOCKS=false. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new ApiError(`GET ${path} → ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}
