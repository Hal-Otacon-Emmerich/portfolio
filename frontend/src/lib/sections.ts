import type { DictKey } from '../i18n/dictionary';

export const SECTIONS: { id: string; labelKey: DictKey }[] = [
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'stack', labelKey: 'nav.stack' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'contact', labelKey: 'nav.contact' },
];

/** Плавный скролл к секции. Отступ под липкую навигацию задаётся через scroll-margin-top в CSS. */
export function scrollToSection(id: string, behavior?: ScrollBehavior) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: behavior ?? (reduceMotion ? 'auto' : 'smooth'), block: 'start' });
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
