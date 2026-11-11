import type { Lang, Profile } from '../api/types';
import { useI18n } from '../i18n/I18nProvider';
import { pad2, scrollToSection, SECTIONS } from '../lib/sections';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'ENG' },
];

export function Header({ profile }: { profile: Profile | null }) {
  const { t, tr, lang, setLang } = useI18n();

  return (
    <>
      <div className="topbar container">
        <span className="label">Spec</span>
        <p className="topbar__title">{profile ? tr(profile.headline) : ' '}</p>
        <span className="label">v1.0 / 2026</span>
      </div>

      <header className="nav">
        <div className="container nav__inner">
          <span className="nav__plus" aria-hidden="true">
            +
          </span>
          <nav className="nav__links" aria-label={t('nav.label')}>
            {SECTIONS.map((section, i) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="nav__link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section.id);
                }}
              >
                {pad2(i + 1)} {t(section.labelKey)}
              </a>
            ))}
          </nav>
          <div className="lang" role="group" aria-label={t('lang.label')}>
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`lang__btn${lang === opt.value ? ' is-active' : ''}`}
                aria-pressed={lang === opt.value}
                onClick={() => setLang(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {profile && (
        <div className="container status">
          <div>
            <p className="status__main">Status — {tr(profile.status)}</p>
            <p className="status__sub">
              {t('hero.location')}: {tr(profile.location)}
            </p>
          </div>
          <div className="status__right">
            <p className="status__main">{profile.primaryStack}</p>
            <p className="status__sub">{profile.secondaryStack}</p>
          </div>
        </div>
      )}
    </>
  );
}
