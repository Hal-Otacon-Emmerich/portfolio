import { ApiError } from '../../api/client';
import type { Text } from '../../api/types';

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Текст для списков и заголовков в админке (берём русскую версию). */
export const preview = (text: Text | undefined): string => (text === undefined ? '' : typeof text === 'string' ? text : text.ru);

export const errorMessage = (err: unknown): string => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Неизвестная ошибка';
};

export type Errors = Record<string, string>;

/* ---------- Проверки ---------- */

export const isFilled = (text: Text | undefined): boolean => {
  if (text === undefined) return false;
  return typeof text === 'string' ? text.trim() !== '' : text.ru.trim() !== '' && text.en.trim() !== '';
};

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Пусто или ссылка вида https://…, mailto:…, tel:… или путь от корня сайта. */
export const isLink = (value: string | undefined): boolean =>
  !value || /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/\S*)$/.test(value.trim());

export class Validator {
  readonly errors: Errors = {};

  require(key: string, value: Text | undefined, message = 'Обязательное поле') {
    if (!isFilled(value) && !this.errors[key]) this.errors[key] = message;
    return this;
  }

  check(key: string, ok: boolean, message: string) {
    if (!ok && !this.errors[key]) this.errors[key] = message;
    return this;
  }

  link(key: string, value: string | undefined) {
    return this.check(key, isLink(value), 'Нужна ссылка: https://…, mailto:… или /путь');
  }

  /** Проверка, что в списке нет одинаковых id. */
  unique(key: string, ids: string[], what: string) {
    const dup = ids.find((id, i) => id && ids.indexOf(id) !== i);
    return this.check(key, !dup, `${what} «${dup}» повторяется`);
  }
}
