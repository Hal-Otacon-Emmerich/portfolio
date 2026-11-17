import * as seed from './mocks';
import type { Experience, Profile, ProjectRecord, StackGroup } from './types';

/**
 * Временная «база данных» в localStorage — пока нет FastAPI.
 * Её читает публичный сайт и меняет админка, так что правки сразу видны на сайте
 * (но только в этом браузере). С бэкендом этот файл не используется.
 */

export interface DbState {
  profile: Profile;
  projects: ProjectRecord[];
  stack: StackGroup[];
  experience: Experience[];
}

const STORAGE_KEY = 'portfolio.mockdb.v1';

const fromSeed = (): DbState =>
  structuredClone({
    profile: seed.profile,
    projects: seed.projects,
    stack: seed.stack,
    experience: seed.experience,
  });

let state: DbState | null = null;

function load(): DbState {
  if (state) return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? (JSON.parse(raw) as DbState) : fromSeed();
  } catch {
    state = fromSeed();
  }
  return state;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* хранилище недоступно — изменения проживут до перезагрузки */
  }
}

export const mockDb = {
  /** Копия данных: снаружи нельзя случайно изменить состояние в обход write(). */
  read(): DbState {
    return structuredClone(load());
  },

  write(update: (draft: DbState) => void) {
    const draft = structuredClone(load());
    update(draft);
    state = draft;
    persist();
  },

  /** Вернуть исходные данные из mocks.ts. */
  reset() {
    state = fromSeed();
    persist();
  },
};

/** Имитация сетевой задержки, чтобы состояния загрузки были видны и в мок-режиме. */
export const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));
