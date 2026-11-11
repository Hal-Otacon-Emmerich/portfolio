import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Lang, Text } from '../api/types';
import { dictionaries, type DictKey } from './dictionary';

const STORAGE_KEY = 'portfolio.lang';
const RU_FAMILY = ['ru', 'uk', 'be', 'kk'];

/** Сначала ручной выбор пользователя, затем языки браузера, по умолчанию — английский. */
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    /* localStorage может быть недоступен */
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of prefs) {
    const base = tag.toLowerCase().split('-')[0];
    if (RU_FAMILY.includes(base)) return 'ru';
    if (base === 'en') return 'en';
  }
  return 'en';
}

type Vars = Record<string, string | number>;
type PluralBase = 'projects.records';

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Текст интерфейса по ключу словаря. */
  t: (key: DictKey, vars?: Vars) => string;
  /** Нужная форма слова для числа n. */
  plural: (base: PluralBase, n: number) => string;
  /** Текст из данных: строка или { ru, en }. */
  tr: (text: Text) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaries[lang];
    const t = (key: DictKey, vars?: Vars) => {
      let str = dict[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      return str;
    };
    const rules = new Intl.PluralRules(lang);
    const plural = (base: PluralBase, n: number) => {
      const key = `${base}.${rules.select(n)}` as DictKey;
      return dict[key] ?? dict[`${base}.other` as DictKey];
    };
    const tr = (text: Text) => (typeof text === 'string' ? text : text[lang]);
    return { lang, setLang, t, plural, tr };
  }, [lang, setLang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = value.t('meta.title');
  }, [lang, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
