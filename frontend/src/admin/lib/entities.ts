import type { Experience, Profile, ProjectDetailFields, ProjectRecord, StackGroup } from '../../api/types';
import { SLUG_RE, Validator, type Errors } from './utils';

const t = () => ({ ru: '', en: '' });

/* ---------- Пустые записи для «Создать» ---------- */

export const emptyDetail = (): ProjectDetailFields => ({
  manualTitle: [''],
  alias: [''],
  drawingTitle: 'Network view 1',
  chain: [{ id: 'N-00', label: '' }],
  modules: [],
  specCode: '',
  specTitle: [''],
  spec: [],
  challenge: t(),
  repoUrl: '',
  repoLabel: { ru: 'Код на GitHub', en: 'Code on GitHub' },
});

export const emptyProject = (number: number): ProjectRecord => {
  const n = String(number).padStart(2, '0');
  return {
    slug: '',
    code: `PRJ-${n}`,
    number: n,
    status: t(),
    variant: 'light',
    title: t(),
    summary: t(),
    specs: [],
    links: [],
    detail: null,
  };
};

export const emptyStack = (number: number): StackGroup => ({ id: `A${number}`, category: '', lines: [''] });

export const emptyExperience = (number: number): Experience => ({
  id: `E-${String(number).padStart(3, '0')}`,
  period: t(),
  role: t(),
  company: t(),
  summary: t(),
  pitch: t(),
  facts: [],
  stack: [],
  metrics: [],
  task: t(),
  done: [],
  challenge: t(),
  learned: t(),
  timeline: [],
  recommendationUrl: '',
  verification: '',
});

/* ---------- Проверки ---------- */

export function validateProfile(p: Profile): Errors {
  const v = new Validator()
    .require('name', p.name)
    .require('headline', p.headline)
    .require('about', p.about)
    .link('resumeUrl', p.resumeUrl)
    .unique('contacts', p.contacts.map((c) => c.id), 'id контакта');
  p.contacts.forEach((c, i) => {
    v.require(`contacts.${i}.id`, c.id).require(`contacts.${i}.label`, c.label).link(`contacts.${i}.href`, c.href);
  });
  return v.errors;
}

export function validateProject(p: ProjectRecord): Errors {
  const v = new Validator()
    .require('slug', p.slug)
    .check('slug', SLUG_RE.test(p.slug), 'Только латиница в нижнем регистре, цифры и дефис: my-project')
    .require('code', p.code)
    .require('number', p.number)
    .require('title', p.title)
    .require('summary', p.summary);
  p.links.forEach((l, i) => v.require(`links.${i}.href`, l.href).link(`links.${i}.href`, l.href));
  if (p.detail) {
    v.check('detail.manualTitle', p.detail.manualTitle.some((s) => s.trim()), 'Нужна хотя бы одна строка')
      .check('detail.chain', p.detail.chain.length > 0, 'Добавьте хотя бы один узел схемы')
      .unique('detail.modules', p.detail.modules.map((m) => m.id), 'id модуля')
      .link('detail.repoUrl', p.detail.repoUrl);
  }
  return v.errors;
}

export function validateStack(s: StackGroup): Errors {
  return new Validator()
    .require('id', s.id)
    .require('category', s.category)
    .check('lines', s.lines.some((l) => l.trim()), 'Нужна хотя бы одна строка').errors;
}

export function validateExperience(e: Experience): Errors {
  return new Validator()
    .require('id', e.id)
    .require('period', e.period)
    .require('role', e.role)
    .require('company', e.company)
    .require('summary', e.summary)
    .link('recommendationUrl', e.recommendationUrl).errors;
}

/** Пустые строки в списках не отправляем на сервер. */
export const cleanLines = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean);
