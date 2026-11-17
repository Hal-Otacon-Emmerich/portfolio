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

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  /** Тело запроса — будет отправлено как JSON. */
  json?: unknown;
  /** Тело запроса как форма (нужно для OAuth2PasswordRequestForm в FastAPI). */
  form?: Record<string, string>;
  /** JWT для заголовка Authorization: Bearer … */
  token?: string | null;
  signal?: AbortSignal;
}

/** FastAPI отдаёт ошибки как { "detail": "..." } или { "detail": [{ msg, loc }] } при ошибке валидации. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === 'string') return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map((d: { msg?: string; loc?: unknown[] }) => [d.loc?.slice(1).join('.'), d.msg].filter(Boolean).join(': '))
        .join('; ');
    }
  } catch {
    /* тело не JSON */
  }
  return `${response.status} ${response.statusText}`;
}

export async function apiRequest<T>(method: Method, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;

  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  } else if (options.form) {
    body = new URLSearchParams(options.form);
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_URL}${path}`, { method, headers, body, signal: options.signal });
  if (!response.ok) throw new ApiError(await readErrorMessage(response), response.status);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>('GET', path, { signal });
}
