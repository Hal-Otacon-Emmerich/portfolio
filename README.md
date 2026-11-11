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

- Кнопка «Схема» на карточке появляется, если у проекта `hasDetail: true`, и для него есть запись в `projectDetails`.
- Резюме: положить файл в `frontend/public/resume.pdf`.
- Язык определяется по браузеру (ru/uk/be/kk → русский, иначе английский), ручной выбор запоминается.
