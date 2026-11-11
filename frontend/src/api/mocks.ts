import type { Experience, Profile, ProjectDetail, ProjectSummary, StackGroup } from './types';

/*
 * Захардкоженные данные. Когда появится FastAPI, этот файл станет
 * образцом ответов API (и сидом для базы, если она будет).
 * Значения в квадратных скобках — заглушки, замените на свои.
 */

export const profile: Profile = {
  name: { ru: '[Ваше имя фамилия]', en: '[Your full name]' },
  headline: {
    ru: 'Fullstack-разработчик: от интерфейса до железа',
    en: 'Fullstack developer: from interface to hardware',
  },
  status: 'Open to work',
  location: { ru: '[Ваш город] / удалённо', en: '[Your city] / remote' },
  primaryStack: 'Python · React',
  secondaryStack: 'FastAPI / Django / Self-hosted',
  about: {
    ru: 'Пишу интерфейсы на React и бэкенд на Python: FastAPI и Django. Помимо кода держу собственный домашний сервер на Raspberry Pi 5 — менеджер паролей, медиасервер, музыкальная библиотека и синхронизация заметок развёрнуты и поддерживаются мной.',
    en: 'I build interfaces in React and backends in Python with FastAPI and Django. Beyond code, I run my own home server on a Raspberry Pi 5 — a password manager, media server, music library and note sync, all deployed and maintained by me.',
  },
  resumeUrl: '/resume.pdf',
  contacts: [
    { id: 'email', label: 'Email', value: '[email]', href: 'mailto:you@example.com' },
    { id: 'github', label: 'GitHub', value: '[github]', href: 'https://github.com/' },
    { id: 'telegram', label: 'Telegram', value: '[@telegram]', href: 'https://t.me/' },
  ],
};

export const projects: ProjectSummary[] = [
  {
    slug: 'portfolio',
    code: 'PRJ-01',
    number: '01',
    status: { ru: 'В разработке', en: 'In progress' },
    variant: 'light',
    title: { ru: 'Этот сайт-портфолио', en: 'This portfolio site' },
    summary: {
      ru: 'Фронтенд и API в одном репозитории, деплой из GitHub на Vercel.',
      en: 'Frontend and API in one repository, deployed from GitHub to Vercel.',
    },
    specs: [
      { label: 'Front', value: 'React' },
      { label: 'Back', value: 'FastAPI' },
      { label: 'Deploy', value: 'Vercel' },
    ],
    links: [
      { kind: 'github', href: 'https://github.com/' },
      { kind: 'demo', href: 'https://vercel.com/' },
    ],
    hasDetail: true,
  },
  {
    slug: 'homelab',
    code: 'PRJ-02',
    number: '02',
    status: 'Active',
    variant: 'dark',
    title: { ru: 'Homelab на Raspberry Pi 5', en: 'Homelab on Raspberry Pi 5' },
    summary: {
      ru: 'Домашний сервер за роутером Keenetic Giga: пароли, медиа, музыка, заметки — всё своё.',
      en: 'A home server behind a Keenetic Giga router: passwords, media, music, notes — all self-hosted.',
    },
    specs: [
      { label: 'Host', value: 'Raspberry Pi 5' },
      { label: 'Services', value: 'Vaultwarden, Jellyfin, Navidrome, Lidarr, slskd, TorrServer' },
      { label: 'Sync', value: 'Obsidian' },
    ],
    links: [{ kind: 'github', href: 'https://github.com/' }],
    hasDetail: true,
  },
  {
    slug: 'project-03',
    code: 'PRJ-03',
    number: '03',
    status: { ru: '[статус]', en: '[status]' },
    variant: 'draft',
    title: { ru: '[Название проекта]', en: '[Project name]' },
    summary: {
      ru: '[Одна-две строки: какую задачу решает и что вы сделали сами.]',
      en: '[One or two lines: what problem it solves and what you built yourself.]',
    },
    specs: [
      { label: 'Front', value: '[—]' },
      { label: 'Back', value: '[Django / FastAPI]' },
      { label: 'DB', value: '[—]' },
    ],
    links: [{ kind: 'github', href: 'https://github.com/' }],
    hasDetail: false,
  },
];

const bySlug = (slug: string) => {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project ${slug}`);
  return project;
};

export const projectDetails: ProjectDetail[] = [
  {
    ...bySlug('portfolio'),
    manualTitle: ['PORTFOLIO', 'MANUAL'],
    alias: ['REACT', 'FASTAPI', 'VERCEL'],
    drawingTitle: 'Deploy view 1',
    chain: [
      { id: 'N-00', label: { ru: 'Браузер', en: 'Browser' } },
      { id: 'N-01', label: 'GitHub — main' },
      { id: 'N-02', label: 'Vercel — build & host', emphasis: true },
    ],
    modules: [
      { id: 'S-01', category: 'Frontend', name: 'React + Vite' },
      { id: 'S-02', category: 'Backend', name: 'FastAPI' },
      { id: 'S-03', category: 'i18n', name: 'RU / EN' },
      { id: 'S-04', category: { ru: 'Данные', en: 'Data' }, name: 'REST / JSON' },
    ],
    specCode: 'PX-01.1',
    specTitle: ['PORTFOLIO', 'SPEC SHEET'],
    spec: [
      { label: 'Status', value: { ru: 'В разработке', en: 'In progress' } },
      { label: 'Front', value: 'React + TypeScript' },
      { label: 'Back', value: 'FastAPI' },
      { label: 'Deploy', value: 'Vercel' },
    ],
    challenge: {
      ru: '[Что было сложнее всего и как вы это решили — 1–2 строки.]',
      en: '[What was hardest and how you solved it — 1–2 lines.]',
    },
    repoUrl: 'https://github.com/',
    repoLabel: { ru: 'Код на GitHub', en: 'Code on GitHub' },
  },
  {
    ...bySlug('homelab'),
    manualTitle: ['HOMELAB', 'MANUAL'],
    alias: ['SELF-HOSTED', 'CORE', 'RASPBERRY PI 5'],
    drawingTitle: 'Network view 1',
    chain: [
      { id: 'N-00', label: 'Internet' },
      { id: 'N-01', label: 'Router — Keenetic Giga' },
      { id: 'N-02', label: 'Host — Raspberry Pi 5', emphasis: true },
    ],
    modules: [
      { id: 'S-01', category: { ru: 'Пароли', en: 'Passwords' }, name: 'Vaultwarden' },
      { id: 'S-02', category: { ru: 'Видео', en: 'Video' }, name: 'Jellyfin' },
      { id: 'S-03', category: { ru: 'Музыка', en: 'Music' }, name: 'Navidrome' },
      { id: 'S-04', category: { ru: 'Библиотека', en: 'Library' }, name: 'Lidarr + slskd' },
      { id: 'S-05', category: { ru: 'Стриминг', en: 'Streaming' }, name: 'TorrServer' },
      { id: 'S-06', category: { ru: 'Заметки', en: 'Notes' }, name: 'Obsidian sync' },
    ],
    specCode: 'PX-02.1',
    specTitle: ['HOMELAB', 'SPEC SHEET'],
    spec: [
      { label: 'Status', value: 'Active' },
      { label: 'Host', value: 'Raspberry Pi 5' },
      { label: 'Network', value: 'Keenetic Giga' },
      { label: 'Services', value: '06' },
    ],
    challenge: {
      ru: '[Что было сложнее всего настроить и как вы это решили — 1–2 строки.]',
      en: '[What was hardest to set up and how you solved it — 1–2 lines.]',
    },
    repoUrl: 'https://github.com/',
    repoLabel: { ru: 'Конфиги на GitHub', en: 'Configs on GitHub' },
  },
];

export const stack: StackGroup[] = [
  { id: 'A1', category: 'Frontend', lines: ['React', 'JavaScript'] },
  { id: 'A2', category: 'Backend', lines: ['Python', 'FastAPI · Django'] },
  { id: 'A3', category: 'Infra', lines: ['Linux · NixOS', 'Self-hosting'] },
  { id: 'A4', category: 'Tools', lines: ['Git · GitHub', 'Vercel'] },
];

const placeholderExperience = (
  id: string,
  period: Experience['period'],
  company: Experience['company'],
): Experience => ({
  id,
  period,
  role: { ru: '[Роль]', en: '[Role]' },
  company,
  summary: { ru: '[Результат одной строкой]', en: '[Result in one line]' },
  pitch: {
    ru: '[Одно предложение: чем занимается продукт и за что вы отвечали.]',
    en: '[One sentence: what the product does and what you were responsible for.]',
  },
  facts: [
    { label: { ru: 'Компания', en: 'Company' }, value: { ru: '[Название]', en: '[Name]' } },
    { label: { ru: 'Сфера', en: 'Domain' }, value: { ru: '[Финтех / e-com / …]', en: '[Fintech / e-com / …]' } },
    { label: { ru: 'Период', en: 'Period' }, value: period },
    { label: { ru: 'Формат', en: 'Format' }, value: { ru: '[Офис / удалённо]', en: '[Office / remote]' } },
    { label: { ru: 'Команда', en: 'Team' }, value: { ru: '[N разработчиков]', en: '[N developers]' } },
  ],
  stack: ['Python', 'FastAPI', 'React'],
  metrics: [
    { id: 'M-01', value: '[N%]', label: { ru: '[что улучшилось]', en: '[what improved]' } },
    { id: 'M-02', value: '[N]', label: { ru: '[фич / эндпоинтов / релизов]', en: '[features / endpoints / releases]' } },
    { id: 'M-03', value: '[N]', label: { ru: '[пользователей / RPS / …]', en: '[users / RPS / …]' } },
  ],
  task: {
    ru: '[Какую проблему решали и почему это было важно для бизнеса.]',
    en: '[What problem you solved and why it mattered to the business.]',
  },
  done: [
    { ru: '[Действие + инструмент]', en: '[Action + tool]' },
    { ru: '[Действие + инструмент]', en: '[Action + tool]' },
    { ru: '[Действие + инструмент]', en: '[Action + tool]' },
  ],
  challenge: {
    ru: '[Самая трудная техническая проблема и как вы её решили.]',
    en: '[The hardest technical problem and how you solved it.]',
  },
  learned: {
    ru: '[Навык или вывод, который забрали с собой.]',
    en: '[A skill or takeaway you carried forward.]',
  },
  timeline: [
    { date: { ru: '[ММ.ГГГГ]', en: '[MM.YYYY]' }, label: { ru: '[Пришёл в команду]', en: '[Joined the team]' } },
    { date: { ru: '[ММ.ГГГГ]', en: '[MM.YYYY]' }, label: { ru: '[Первый релиз]', en: '[First release]' } },
    { date: { ru: '[ММ.ГГГГ]', en: '[MM.YYYY]' }, label: { ru: '[Ключевое событие]', en: '[Key milestone]' } },
    {
      date: { ru: '[Сейчас]', en: '[Now]' },
      label: { ru: '[Текущая зона ответственности]', en: '[Current scope]' },
      current: true,
    },
  ],
  recommendationUrl: undefined,
  verification: `${id.replace('-', '')}-[ГОД]-DEV`,
});

export const experience: Experience[] = [
  placeholderExperience(
    'E-001',
    { ru: '[ММ.ГГГГ — сейчас]', en: '[MM.YYYY — now]' },
    { ru: '[Компания]', en: '[Company]' },
  ),
  placeholderExperience(
    'E-002',
    { ru: '[ММ.ГГГГ — ММ.ГГГГ]', en: '[MM.YYYY — MM.YYYY]' },
    { ru: '[Компания / учёба / курс]', en: '[Company / study / course]' },
  ),
];
