import type { Profile } from '../api/types';
import { useI18n } from '../i18n/I18nProvider';
import { PlusRow } from './PlusRow';

export function Contact({ profile }: { profile: Profile }) {
  const { t, tr } = useI18n();

  return (
    <section id="contact" className="contact container" aria-labelledby="contact-title">
      <PlusRow />
      <div className="contact__grid">
        <h2 id="contact-title" className="contact__title">
          {t('contact.title')}
        </h2>
        <dl className="contact__list">
          {profile.contacts.map((c) => (
            <div key={c.id} className="contact__row">
              <dt>{c.label}</dt>
              <dd>
                <a
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {tr(c.value)}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <footer className="footer">
        <span className="label">Unit</span>
        <p className="footer__bar">{t('footer.slogan')}</p>
        <span className="label">DEV-01</span>
      </footer>
    </section>
  );
}
