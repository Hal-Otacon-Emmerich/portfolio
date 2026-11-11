import type { Profile } from '../api/types';
import { useI18n } from '../i18n/I18nProvider';
import { scrollToSection } from '../lib/sections';
import { BoardIllustration } from './BoardIllustration';
import { PlusRow } from './PlusRow';

export function Hero({ profile }: { profile: Profile }) {
  const { t, tr } = useI18n();

  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__frame">
        <span className="corner corner--tl" aria-hidden="true" />
        <span className="corner corner--tr" aria-hidden="true" />
        <span className="corner corner--bl" aria-hidden="true" />
        <span className="corner corner--br" aria-hidden="true" />

        <p className="hero__unit label">UNIT / DEV-01 — {tr(profile.name)}</p>
        <BoardIllustration className="hero__art" />
        <h1 id="hero-title" className="hero__title" aria-label="Dev 01 — Full stack">
          <span aria-hidden="true">DEV</span>
          <span aria-hidden="true" className="hero__title-right">
            01
          </span>
          <span aria-hidden="true">FULL</span>
          <span aria-hidden="true" className="hero__title-right">
            STACK
          </span>
        </h1>
        <p className="hero__fig label">FIG. 01 — SBC HOST / EXPLODED VIEW · NTS</p>
      </div>

      <PlusRow />

      <div className="hero__bottom">
        <p className="hero__about">{tr(profile.about)}</p>
        <div className="hero__cta">
          <p className="hero__cta-title">{t('hero.ctaTitle')}</p>
          <div className="btn-row">
            <button type="button" className="btn btn--ink" onClick={() => scrollToSection('projects')}>
              {t('hero.ctaProjects')} →
            </button>
            <a className="btn" href={profile.resumeUrl} download>
              {t('hero.ctaResume')} ↓
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
