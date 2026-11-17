import { ApiError, apiRequest, USE_MOCKS } from '../../api/client';
import { delay, mockDb, type DbState } from '../../api/mockDb';
import type { Experience, Profile, ProjectRecord, StackGroup } from '../../api/types';
import { session } from '../auth/session';

/**
 * API админки. Все запросы, кроме входа, идут с заголовком Authorization: Bearer <JWT>.
 * Контракт для FastAPI описан в README (раздел «Админ-панель»).
 */

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  /** Время жизни токена в секундах. */
  expires_in: number;
}

export interface AdminUser {
  username: string;
}

export interface CollectionApi<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(item: T): Promise<T>;
  update(id: string, item: T): Promise<T>;
  remove(id: string): Promise<void>;
  /** Новый порядок записей: полный список id. */
  reorder(ids: string[]): Promise<T[]>;
}

const enc = encodeURIComponent;

/* =========================================================
   Режим с бэкендом
   ========================================================= */

async function authed<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, json?: unknown): Promise<T> {
  const current = session.get();
  if (!current) throw new ApiError('Сессия истекла, войдите снова', 401);
  try {
    return await apiRequest<T>(method, path, { json, token: current.token });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) session.clear('unauthorized');
    throw err;
  }
}

function remoteCollection<T>(name: string): CollectionApi<T> {
  const base = `/api/admin/${name}`;
  return {
    list: () => authed<T[]>('GET', base),
    get: (id) => authed<T>('GET', `${base}/${enc(id)}`),
    create: (item) => authed<T>('POST', base, item),
    update: (id, item) => authed<T>('PUT', `${base}/${enc(id)}`, item),
    remove: (id) => authed<void>('DELETE', `${base}/${enc(id)}`),
    reorder: (ids) => authed<T[]>('PUT', `${base}/order`, { ids }),
  };
}

async function remoteLogin(username: string, password: string): Promise<AdminUser> {
  // FastAPI: OAuth2PasswordRequestForm принимает application/x-www-form-urlencoded
  const token = await apiRequest<TokenResponse>('POST', '/api/auth/login', { form: { username, password } });
  session.set({ token: token.access_token, username, expiresAt: Date.now() + token.expires_in * 1000 });
  try {
    const me = await authed<AdminUser>('GET', '/api/auth/me');
    session.set({ ...session.get()!, username: me.username });
    return me;
  } catch (err) {
    session.clear('unauthorized');
    throw err;
  }
}

/* =========================================================
   Мок-режим (без бэкенда)
   ВНИМАНИЕ: это не защита — код фронтенда видит любой посетитель.
   Поэтому вход без бэкенда разрешён только в dev-режиме (npm run dev).
   ========================================================= */

export const MOCK_LOGIN_ALLOWED = import.meta.env.DEV;
const MOCK_USER = import.meta.env.VITE_ADMIN_MOCK_USER || 'admin';
const MOCK_PASSWORD = import.meta.env.VITE_ADMIN_MOCK_PASSWORD || 'admin';
const MOCK_TTL_SECONDS = 60 * 60;
const ISSUED_KEY = 'portfolio.mock.issued-token';

async function mockLogin(username: string, password: string): Promise<AdminUser> {
  await delay(400);
  if (!MOCK_LOGIN_ALLOWED) {
    throw new ApiError('Вход без бэкенда отключён в продакшн-сборке. Подключите FastAPI.', 503);
  }
  if (username !== MOCK_USER || password !== MOCK_PASSWORD) {
    throw new ApiError('Неверный логин или пароль', 401);
  }
  const token = `mock.${crypto.randomUUID()}`;
  sessionStorage.setItem(ISSUED_KEY, token);
  session.set({ token, username, expiresAt: Date.now() + MOCK_TTL_SECONDS * 1000 });
  return { username };
}

/** Аналог проверки JWT на сервере. */
async function mockGuard() {
  await delay();
  const current = session.get();
  if (!current || current.token !== sessionStorage.getItem(ISSUED_KEY)) {
    session.clear('unauthorized');
    throw new ApiError('Не авторизован', 401);
  }
}

type CollectionKey = 'projects' | 'stack' | 'experience';
type Item<K extends CollectionKey> = DbState[K][number];

function mockCollection<K extends CollectionKey>(key: K, idOf: (item: Item<K>) => string): CollectionApi<Item<K>> {
  const items = () => mockDb.read()[key] as Item<K>[];
  const exists = (id: string) => items().some((i) => idOf(i) === id);
  const find = (id: string) => {
    const found = items().find((i) => idOf(i) === id);
    if (!found) throw new ApiError('Запись не найдена', 404);
    return found;
  };
  const save = (fn: (list: Item<K>[]) => Item<K>[]) =>
    mockDb.write((db) => {
      db[key] = fn(db[key] as Item<K>[]) as DbState[K];
    });
  const conflict = (id: string) => new ApiError(`Запись «${id}» уже существует`, 409);

  return {
    async list() {
      await mockGuard();
      return items();
    },
    async get(id) {
      await mockGuard();
      return find(id);
    },
    async create(item) {
      await mockGuard();
      if (exists(idOf(item))) throw conflict(idOf(item));
      save((list) => [...list, item]);
      return item;
    },
    async update(id, item) {
      await mockGuard();
      find(id);
      if (idOf(item) !== id && exists(idOf(item))) throw conflict(idOf(item));
      save((list) => list.map((i) => (idOf(i) === id ? item : i)));
      return item;
    },
    async remove(id) {
      await mockGuard();
      find(id);
      save((list) => list.filter((i) => idOf(i) !== id));
    },
    async reorder(ids) {
      await mockGuard();
      const current = items();
      const same = ids.length === current.length && current.every((i) => ids.includes(idOf(i)));
      if (!same) throw new ApiError('Список для сортировки не совпадает с данными', 422);
      save((list) => ids.map((id) => list.find((i) => idOf(i) === id)!));
      return items();
    },
  };
}

/* =========================================================
   Публичный объект
   ========================================================= */

export const adminApi = {
  isMock: USE_MOCKS,

  login: (username: string, password: string) =>
    USE_MOCKS ? mockLogin(username, password) : remoteLogin(username, password),

  async me(): Promise<AdminUser> {
    if (USE_MOCKS) {
      await mockGuard();
      return { username: session.get()!.username };
    }
    return authed<AdminUser>('GET', '/api/auth/me');
  },

  logout() {
    sessionStorage.removeItem(ISSUED_KEY);
    session.clear('manual');
  },

  async getProfile(): Promise<Profile> {
    if (!USE_MOCKS) return authed<Profile>('GET', '/api/admin/profile');
    await mockGuard();
    return mockDb.read().profile;
  },

  async updateProfile(profile: Profile): Promise<Profile> {
    if (!USE_MOCKS) return authed<Profile>('PUT', '/api/admin/profile', profile);
    await mockGuard();
    mockDb.write((db) => {
      db.profile = profile;
    });
    return profile;
  },

  projects: (USE_MOCKS
    ? mockCollection('projects', (p) => p.slug)
    : remoteCollection<ProjectRecord>('projects')) as CollectionApi<ProjectRecord>,

  stack: (USE_MOCKS
    ? mockCollection('stack', (s) => s.id)
    : remoteCollection<StackGroup>('stack')) as CollectionApi<StackGroup>,

  experience: (USE_MOCKS
    ? mockCollection('experience', (e) => e.id)
    : remoteCollection<Experience>('experience')) as CollectionApi<Experience>,

  /** Только мок-режим: вернуть демо-данные. */
  async resetMockData() {
    await mockGuard();
    mockDb.reset();
  },
};
