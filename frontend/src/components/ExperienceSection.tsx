import { useCallback, useState } from 'react';
import type { Experience } from '../api/types';
import type { ResourceState } from '../hooks/useResource';
import { useI18n } from '../i18n/I18nProvider';
import { ExperienceModal } from './ExperienceModal';
import { ResourceStatus } from './ResourceStatus';
import { SectionHead } from './SectionHead';

export function ExperienceSection({ state }: { state: ResourceState<Experience[]> }) {
  const { t, tr } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = state.data ?? [];
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <section id="experience" className="section container" aria-labelledby="experience-title">
      <SectionHead id="experience-title" number="03" title={t('exp.title')} meta={t('exp.caution')} />
      <ResourceStatus state={state} />

      <div className="exp">
        <div className="exp__row exp__row--head" aria-hidden="true">
          <span>{t('exp.col.id')}</span>
          <span>{t('exp.col.period')}</span>
          <span>{t('exp.col.role')}</span>
          <span>{t('exp.col.done')}</span>
          <span className="exp__open-head">{t('exp.col.open')}</span>
        </div>
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className="exp__row"
            aria-haspopup="dialog"
            onClick={() => setOpenIndex(i)}
          >
            <span className="exp__id">{item.id}</span>
            <span className="exp__period">{tr(item.period)}</span>
            <span className="exp__role">
              {tr(item.role)} — {tr(item.company)}
            </span>
            <span className="exp__done">{tr(item.summary)}</span>
            <span className="exp__arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
      <p className="exp__hint">{t('exp.hint')}</p>

      {openIndex !== null && items[openIndex] && (
        <ExperienceModal items={items} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
      )}
    </section>
  );
}
