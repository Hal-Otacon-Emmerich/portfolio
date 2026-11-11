import type { Lang } from '../api/types';

/** Тексты интерфейса. Контент (проекты, опыт) переводится в данных — см. api/mocks.ts. */
const ru = {
  'meta.title': 'Портфолио — Fullstack-разработчик',

  'nav.label': 'Разделы сайта',
  'nav.projects': 'Проекты',
  'nav.stack': 'Стек',
  'nav.experience': 'Опыт',
  'nav.contact': 'Контакт',
  'lang.label': 'Язык',

  'hero.location': 'Локация',
  'hero.ctaTitle': 'Для работодателей — открытый доступ',
  'hero.ctaProjects': 'Смотреть проекты',
  'hero.ctaResume': 'Резюме.pdf',

  'projects.title': 'Проекты',
  'projects.index': 'Module index — {n} {records}',
  'projects.records.one': 'запись',
  'projects.records.few': 'записи',
  'projects.records.many': 'записей',
  'projects.records.other': 'записи',
  'projects.scheme': 'Схема',
  'projects.link.github': 'GitHub',
  'projects.link.demo': 'Демо',

  'stack.title': 'Стек',
  'stack.sheet': 'Component sheet',

  'exp.title': 'Опыт',
  'exp.caution': 'Processed with caution',
  'exp.col.id': 'ID',
  'exp.col.period': 'Период',
  'exp.col.role': 'Роль / компания',
  'exp.col.done': 'Что сделано',
  'exp.col.open': 'Open',
  'exp.hint': 'Нажмите на строку, чтобы открыть подробное досье.',

  'modal.caseFile': 'Case file',
  'modal.record': 'Запись {i} из {n}',
  'modal.close': 'Закрыть',
  'modal.companyFile': 'Company file',
  'modal.stack': 'Stack',
  'modal.role': 'Роль / позиция',
  'modal.at': 'в',
  'modal.task': 'Задача',
  'modal.done': 'Что сделал',
  'modal.challenge': 'Сложность',
  'modal.learned': 'Чему научился',
  'modal.timeline': 'Timeline',
  'modal.recommendation': 'Рекомендация / ссылка',
  'modal.prev': 'Предыдущий',
  'modal.next': 'Следующий',
  'modal.verified': 'Verified',

  'contact.title': 'Напишите мне',
  'footer.slogan': 'Built for the next commit.',

  'project.file': 'Project file',
  'project.alias': 'Project alias',
  'project.drawing': 'Technical drawing',
  'project.moduleSpec': 'Module spec',
  'project.scale': 'Scale 1:1 — всё настоящее',
  'project.back': 'Назад к проектам',
  'project.home': 'На главную',
  'project.nav': 'Другие проекты',
  'project.unavailable': 'Схема пока не готова',
  'project.notFound': 'Проект не найден',

  'state.loading': 'Загрузка…',
  'state.error': 'Не удалось загрузить данные',
};

export type DictKey = keyof typeof ru;

const en: Record<DictKey, string> = {
  'meta.title': 'Portfolio — Fullstack developer',

  'nav.label': 'Site sections',
  'nav.projects': 'Projects',
  'nav.stack': 'Stack',
  'nav.experience': 'Experience',
  'nav.contact': 'Contact',
  'lang.label': 'Language',

  'hero.location': 'Location',
  'hero.ctaTitle': 'For employers — open access',
  'hero.ctaProjects': 'View projects',
  'hero.ctaResume': 'Resume.pdf',

  'projects.title': 'Projects',
  'projects.index': 'Module index — {n} {records}',
  'projects.records.one': 'record',
  'projects.records.few': 'records',
  'projects.records.many': 'records',
  'projects.records.other': 'records',
  'projects.scheme': 'Schema',
  'projects.link.github': 'GitHub',
  'projects.link.demo': 'Demo',

  'stack.title': 'Stack',
  'stack.sheet': 'Component sheet',

  'exp.title': 'Experience',
  'exp.caution': 'Processed with caution',
  'exp.col.id': 'ID',
  'exp.col.period': 'Period',
  'exp.col.role': 'Role / company',
  'exp.col.done': 'What I did',
  'exp.col.open': 'Open',
  'exp.hint': 'Click a row to open the full case file.',

  'modal.caseFile': 'Case file',
  'modal.record': 'Record {i} of {n}',
  'modal.close': 'Close',
  'modal.companyFile': 'Company file',
  'modal.stack': 'Stack',
  'modal.role': 'Role / position',
  'modal.at': 'at',
  'modal.task': 'Task',
  'modal.done': 'What I did',
  'modal.challenge': 'Challenge',
  'modal.learned': 'What I learned',
  'modal.timeline': 'Timeline',
  'modal.recommendation': 'Reference / link',
  'modal.prev': 'Previous',
  'modal.next': 'Next',
  'modal.verified': 'Verified',

  'contact.title': 'Get in touch',
  'footer.slogan': 'Built for the next commit.',

  'project.file': 'Project file',
  'project.alias': 'Project alias',
  'project.drawing': 'Technical drawing',
  'project.moduleSpec': 'Module spec',
  'project.scale': 'Scale 1:1 — all real',
  'project.back': 'Back to projects',
  'project.home': 'Home',
  'project.nav': 'Other projects',
  'project.unavailable': 'Schema not ready yet',
  'project.notFound': 'Project not found',

  'state.loading': 'Loading…',
  'state.error': 'Could not load data',
};

export const dictionaries: Record<Lang, Record<DictKey, string>> = { ru, en };
