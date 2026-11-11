/**
 * Контракт данных между фронтендом и будущим FastAPI.
 * Эти же формы стоит описать Pydantic-моделями на бэкенде —
 * тогда переключение с моков на API не потребует правок в компонентах.
 */

export type Lang = 'ru' | 'en';

/** Переведённая строка. */
export type Localized = Record<Lang, string>;

/** Строка, одинаковая для всех языков (имена технологий и т.п.), или перевод. */
export type Text = string | Localized;

export interface SpecRow {
  label: Text;
  value: Text;
}

/* ---------- Профиль ---------- */

export interface ContactLink {
  id: string;
  label: string;
  value: Text;
  href: string;
}

export interface Profile {
  name: Text;
  headline: Text;
  status: Text;
  location: Text;
  primaryStack: string;
  secondaryStack: string;
  about: Text;
  resumeUrl: string;
  contacts: ContactLink[];
}

/* ---------- Проекты ---------- */

export type ExternalLinkKind = 'github' | 'demo';

export interface ExternalLink {
  kind: ExternalLinkKind;
  href: string;
}

/** light — светлая карточка, dark — тёмная, draft — пунктирная заготовка. */
export type ProjectVariant = 'light' | 'dark' | 'draft';

export interface ProjectSummary {
  slug: string;
  code: string;
  number: string;
  status: Text;
  variant: ProjectVariant;
  title: Text;
  summary: Text;
  specs: SpecRow[];
  links: ExternalLink[];
  /** true — у проекта есть страница-схема и на карточке появляется кнопка «Схема». */
  hasDetail: boolean;
}

export interface DiagramNode {
  id: string;
  label: Text;
  emphasis?: boolean;
}

export interface DiagramModule {
  id: string;
  category: Text;
  name: string;
}

export interface ProjectDetail extends ProjectSummary {
  manualTitle: string[];
  alias: string[];
  drawingTitle: Text;
  /** Узлы схемы сверху вниз, соединённые линиями. */
  chain: DiagramNode[];
  /** Модули/сервисы под последним узлом. */
  modules: DiagramModule[];
  specCode: string;
  specTitle: string[];
  spec: SpecRow[];
  challenge: Text;
  repoUrl?: string;
  repoLabel: Text;
}

/* ---------- Стек ---------- */

export interface StackGroup {
  id: string;
  category: string;
  lines: string[];
}

/* ---------- Опыт ---------- */

export interface Metric {
  id: string;
  value: string;
  label: Text;
}

export interface TimelineEvent {
  date: Text;
  label: Text;
  current?: boolean;
}

export interface Experience {
  id: string;
  period: Text;
  role: Text;
  company: Text;
  /** Короткая строка для таблицы. */
  summary: Text;
  /** Одно предложение под заголовком в досье. */
  pitch: Text;
  facts: SpecRow[];
  stack: string[];
  metrics: Metric[];
  task: Text;
  done: Text[];
  challenge: Text;
  learned: Text;
  timeline: TimelineEvent[];
  recommendationUrl?: string;
  verification: string;
}
