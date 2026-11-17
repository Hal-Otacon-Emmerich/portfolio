# portfolio

Сайт-портфолио: React (фронтенд) + FastAPI (бэкенд, будет добавлен).

```
frontend/   React + TypeScript + Vite
backend/    FastAPI — пока нет
```

## Запуск фронтенда

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # проверка типов + сборка в dist/
```

## Где что лежит

| Путь | Что там |
| --- | --- |
| `src/api/mocks.ts` | Весь контент сайта (профиль, проекты, стек, опыт). Заглушки в `[скобках]` заменить на свои. |
| `src/api/types.ts` | Контракт данных — то же стоит описать Pydantic-моделями в FastAPI. |
| `src/api/portfolio.ts` | Единственная точка получения данных: мок или запрос к API. |
| `src/i18n/dictionary.ts` | Тексты интерфейса RU / EN. |
| `src/pages/` | Главная и страница проекта (`/projects/:slug`). |
| `src/styles/` | Токены и стили. |
| `src/api/mockDb.ts` | Временная «база» в localStorage: её читает сайт и меняет админка, пока нет FastAPI. |
| `src/admin/` | Админ-панель (`/admin`), грузится отдельным чанком. |
| `src/styles/main.scss` | Точка входа стилей (SCSS), подключает все партиалы. |
| `src/styles/abstracts/` | Переменные (цвета, шрифты, отступы, размеры, брейкпоинты), функции `rem()`/`em()` и миксины. Каждый партиал подключает их через `@use '../abstracts' as *;`. |
| `src/styles/{base,components,layout,sections,pages}/` | Стили по блокам. |

## Подключение FastAPI

1. Реализовать эндпоинты, которые уже ожидает `src/api/portfolio.ts`:

   | Метод | Путь | Ответ |
   | --- | --- | --- |
   | GET | `/api/profile` | `Profile` |
   | GET | `/api/projects` | `ProjectSummary[]` |
   | GET | `/api/projects/{slug}` | `ProjectDetail` (404, если нет) |
   | GET | `/api/stack` | `StackGroup[]` |
   | GET | `/api/experience` | `Experience[]` |

   Переводимые поля приходят как `{"ru": "...", "en": "..."}` или просто строкой.

2. В `frontend/.env` поставить `VITE_USE_MOCKS=false`.
   В dev-режиме Vite проксирует `/api` на `http://localhost:8000`.
   В проде задать `VITE_API_URL`, если API живёт на другом домене (и включить CORS).

## Контент

- Контент удобнее всего менять через админку: `http://localhost:5173/admin`.
- Кнопка «Схема» на карточке появляется, если у проекта заполнена страница-схема (`detail` не `null`).
- Резюме: положить файл в `frontend/public/resume.pdf`.
- Язык определяется по браузеру (ru/uk/be/kk → русский, иначе английский), ручной выбор запоминается.

## Админ-панель

Адрес: `/admin`. Разделы: профиль, проекты (вместе со страницей-схемой), стек, опыт.
Можно добавлять, изменять, удалять записи и менять их порядок (порядок = порядок на сайте).

### Без бэкенда (сейчас)

- Вход работает **только в `npm run dev`**. Логин/пароль — `VITE_ADMIN_MOCK_USER` / `VITE_ADMIN_MOCK_PASSWORD`
  в `frontend/.env.local` (по умолчанию `admin` / `admin`).
- Изменения сохраняются в localStorage этого браузера и сразу видны на сайте здесь же.
  «Обзор → Сбросить данные» возвращает содержимое `mocks.ts`.
- В продакшн-сборке без бэкенда вход отключён: проверка пароля на фронтенде не является защитой —
  любой может открыть код сайта.

### Как устроена защита

Настоящая защита — на сервере. Фронтенд только хранит токен и прячет интерфейс:

1. `POST /api/auth/login` — сервер проверяет пароль (хранить **хеш**, например bcrypt) и выдаёт JWT.
2. Токен лежит в `sessionStorage` (пропадает при закрытии вкладки) и уходит в каждом запросе
   как `Authorization: Bearer <token>`.
3. Сервер проверяет токен на **каждом** эндпоинте `/api/admin/*`. Без валидного токена — `401`.
4. На `401` или по истечении срока токена админка сама выходит и показывает форму входа.

### Контракт API для FastAPI

Ошибки — в стандартном формате FastAPI `{"detail": "..."}`: его текст админка показывает пользователю.

**Авторизация**

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | форма `username`, `password` (`OAuth2PasswordRequestForm`) | `{"access_token", "token_type": "bearer", "expires_in": <сек>}`; `401` при неверных данных |
| GET | `/api/auth/me` | — | `{"username"}` |

**Контент** (все требуют `Authorization: Bearer`)

| Метод | Путь | Тело | Ответ |
| --- | --- | --- | --- |
| GET / PUT | `/api/admin/profile` | `Profile` | `Profile` |
| GET / POST | `/api/admin/projects` | `ProjectRecord` | `ProjectRecord[]` / `ProjectRecord`; `409`, если slug занят |
| GET / PUT / DELETE | `/api/admin/projects/{slug}` | `ProjectRecord` | `ProjectRecord` / `204` |
| PUT | `/api/admin/projects/order` | `{"ids": ["slug", ...]}` | `ProjectRecord[]` |
| то же | `/api/admin/stack`, `/api/admin/stack/{id}`, `/api/admin/stack/order` | `StackGroup` | |
| то же | `/api/admin/experience`, `/api/admin/experience/{id}`, `/api/admin/experience/order` | `Experience` | |

`PUT /…/{id}` может поменять сам id/slug (в теле приходит новый). Маршрут `/order` объявите **раньше** `/{id}`,
иначе FastAPI примет `order` за id.

`ProjectRecord` — это проект с полем `detail` (данные страницы-схемы или `null`).
Публичные эндпоинты собирают из него ответы: `GET /api/projects` → `ProjectSummary`
(`hasDetail = detail is not None`), `GET /api/projects/{slug}` → карточка + поля `detail`.
Все типы — в `frontend/src/api/types.ts`.

### Хостинг

- `vercel.json` отдаёт для `/admin` заголовок `X-Robots-Tag: noindex`.
- Если API на другом домене: `VITE_API_URL` + CORS на FastAPI с разрешённым заголовком `Authorization`.
