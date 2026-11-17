/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_USE_MOCKS?: string;
  /** Только для мок-режима в dev: логин и пароль админки без бэкенда. */
  readonly VITE_ADMIN_MOCK_USER?: string;
  readonly VITE_ADMIN_MOCK_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
